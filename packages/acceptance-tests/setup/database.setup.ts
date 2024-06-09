import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { test as setup } from '@playwright/test';

/**
 * Sets up new database before all tests are run.
 */
setup('Set up new database', async () => {
  console.time('database');
  console.log(
    `Running migrations and seeding the database ${process.env.DB_CONNECTION}`,
  );

  if (existsSync(process.env.DB_CONNECTION!)) {
    await rm(process.env.DB_CONNECTION!);
  }

  execSync('npm run db:setup -w @nou/acceptance-tests');

  console.log(`${process.env.DB_CONNECTION} is set up!`);
  console.timeEnd('database');
});