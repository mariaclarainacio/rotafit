// Testes do banco com PGlite (Postgres real, rodando dentro do Node, sem Docker).
// Aplica o MESMO schema.sql que você roda no Supabase.
// Execução: node --test supabase/tests/   (ou npm run test:db)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const SUPABASE = fileURLToPath(new URL("..", import.meta.url));
const ALICE = "11111111-1111-1111-1111-111111111111";
const BOB = "22222222-2222-2222-2222-222222222222";

const SUPABASE_STUBS = `
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public, auth to anon, authenticated;
  insert into auth.users (id) values ('${ALICE}'), ('${BOB}');
`;

let db;

before(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  await db.exec(readFileSync(`${SUPABASE}/schema.sql`, "utf8"));
});

after(async () => {
  await db.close();
});

async function as(uid, fn) {
  await db.exec(`set role authenticated;
     select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
  try {
    return await fn();
  } finally {
    await db.exec(
      `reset role; select set_config('request.jwt.claim.sub', '', false);`,
    );
  }
}

const one = async (sql, params = []) => (await db.query(sql, params)).rows[0];
const rows = async (sql, params = []) => (await db.query(sql, params)).rows;

const sampleRoute = JSON.stringify([
  { lat: -15.7997, lng: -47.8645, t: 0 },
  { lat: -15.7969, lng: -47.8756, t: 300000 },
]);

async function insertRun(uid, overrides = {}) {
  const r = {
    started_at: "2026-09-20T10:00:00Z",
    ended_at: "2026-09-20T10:30:00Z",
    distance_meters: 5000,
    duration_seconds: 1800,
    avg_pace_sec_per_km: 360,
    route: sampleRoute,
    spotify_track_name: "Alive — Pearl Jam",
    ...overrides,
  };
  return as(uid, async () => {
    const row = await one(
      `insert into runs
        (user_id, started_at, ended_at, distance_meters, duration_seconds,
         avg_pace_sec_per_km, route, spotify_track_name)
      values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8) returning id`,
      [
        uid,
        r.started_at,
        r.ended_at,
        r.distance_meters,
        r.duration_seconds,
        r.avg_pace_sec_per_km,
        r.route,
        r.spotify_track_name,
      ],
    );
    return row.id;
  });
}

describe("segurança e privacidade", () => {
  it("cada usuário só lê as próprias corridas", async () => {
    const id = await insertRun(ALICE);
    assert.equal(
      (await as(ALICE, () => rows("select id from runs where id = $1", [id])))
        .length,
      1,
    );
    assert.equal(
      (await as(BOB, () => rows("select id from runs where id = $1", [id])))
        .length,
      0,
    );
  });

  it("não é possível criar uma corrida em nome de outro usuário", async () => {
    await assert.rejects(
      as(ALICE, () =>
        db.query(
          `insert into runs (user_id, started_at, ended_at, distance_meters, duration_seconds,
route)
          values ($1, now(), now(), 1000, 300, '[]'::jsonb)`,
          [BOB],
        ),
      ),
      /new row violates row-level security policy/,
    );
  });

  it("visitante (anon) não lê nem escreve", async () => {
    await db.exec("set role anon");
    try {
      await assert.rejects(db.query("select * from runs"), /permission denied/);
    } finally {
      await db.exec("reset role");
    }
  });

  it("cada usuário só apaga as próprias corridas", async () => {
    const id = await insertRun(ALICE);

    await as(BOB, () => db.query("delete from runs where id = $1", [id]));
    assert.equal(
      (await as(ALICE, () => rows("select id from runs where id = $1", [id])))
        .length,
      1,
    );
    await as(ALICE, () => db.query("delete from runs where id = $1", [id]));
    assert.equal(
      (await as(ALICE, () => rows("select id from runs where id = $1", [id])))
        .length,
      0,
    );
  });
});

describe("restrições dos dados", () => {
  it("recusa distância negativa", async () => {
    await assert.rejects(
      insertRun(ALICE, { distance_meters: -1 }),
      /distance_meters/,
    );
  });

  it("recusa duração zero ou negativa", async () => {
    await assert.rejects(
      insertRun(ALICE, { duration_seconds: 0 }),
      /duration_seconds/,
    );
  });

  it("recusa terminar antes de começar", async () => {
    await assert.rejects(
      insertRun(ALICE, {
        started_at: "2026-09-20T10:30:00Z",
        ended_at: "2026-09-20T10:00:00Z",
      }),
      /ended_after_started/,
    );
  });

  it("aceita ritmo médio nulo (corrida sem distância registrada)", async () => {
    const id = await insertRun(ALICE, {
      avg_pace_sec_per_km: null,
      distance_meters: 0,
    });
    assert.equal(
      (await one("select avg_pace_sec_per_km from runs where id = $1", [id]))
        .avg_pace_sec_per_km,
      null,
    );
  });

  it("guarda a rota como jsonb consultável", async () => {
    const id = await insertRun(ALICE);
    const row = await one(
      "select jsonb_array_length(route) as n from runs where id = $1",
      [id],
    );
    assert.equal(row.n, 2);
  });
});

describe("weekly_stats", () => {
  it("soma só as corridas da semana atual e só as do usuário logado", async () => {
    const now = await one("select now() as now");
    const started = now.now.toISOString();
    await insertRun(ALICE, {
      started_at: started,
      ended_at: started,
      distance_meters: 3000,
      duration_seconds: 900,
    });
    await insertRun(ALICE, {
      started_at: started,
      ended_at: started,
      distance_meters: 2000,
      duration_seconds: 600,
    });
    await insertRun(BOB, {
      started_at: started,

      ended_at: started,
      distance_meters: 9000,
      duration_seconds: 2700,
    });
    await insertRun(ALICE, {
      started_at: "2020-01-01T10:00:00Z",
      ended_at: "2020-01-01T10:10:00Z",
    }); // fora da semana

    const alice = await as(ALICE, () => one("select * from weekly_stats()"));
    assert.equal(Number(alice.total_distance_meters), 5000);
    assert.equal(Number(alice.run_count), 2);

    const bob = await as(BOB, () => one("select * from weekly_stats()"));
    assert.equal(Number(bob.total_distance_meters), 9000);
    assert.equal(Number(bob.run_count), 1);
  });

  it("visitante (anon) não executa a função", async () => {
    await db.exec("set role anon");
    try {
      await assert.rejects(
        db.query("select * from weekly_stats()"),
        /permission denied/,
      );
    } finally {
      await db.exec("reset role");
    }
  });
});
