#!/usr/bin/env node

import { execSync } from 'child_process';
import { input, select } from '@inquirer/prompts';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

async function runCommand(command, opts = {})
{
    try
    {
        execSync(command, { stdio: 'inherit', ...opts });
        return true
    }
    catch (error)
    {
        console.error(chalk.red(`\n✖ Error running: ${ command }\n`), error?.message || error);
        return false;
    }
}

function dirExists(dir)
{
    try
    {
        const stat = fs.existsSync(dir) && fs.statSync(dir);
        return !!(stat && stat.isDirectory());
    }
    catch {
        return false;
    }
}

function toNpmName(name)
{
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+/, '')
        .slice(0, 214);
}


function banner()
{
    console.log(`${ chalk.redBright.bgBlack(`
██████╗ ██╗███╗   ██╗ ██████╗         ██╗███████╗
██╔══██╗██║████╗  ██║██╔═══██╗        ██║██╔════╝
██████╔╝██║██╔██╗ ██║██║   ██║        ██║███████╗
██╔══██╗██║██║╚██╗██║██║   ██║   ██   ██║╚════██║
██║  ██║██║██║ ╚████║╚██████╔╝██╗╚█████╔╝███████║
╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝ ╚════╝ ╚══════╝
`) }

${ chalk.white.bold('Become a sponsor & support Rino.js!') }
${ chalk.white('https://github.com/sponsors/opdev1004') }
    `);
}


const TEMPLATES = {
    web: {
        name: 'Rino Static Website (starter)',
        repo: 'rinojs/create-rino-template#main',
        post: [],
        next: [
            'npm install',
            'npm run dev',
        ],
    },
    electron: {
        name: 'Rino Electron (Starter)',
        repo: 'rinojs/rino-electron#main',
        post: [],
        next: [
            'npm install',
            'npm run dev'
        ],
    },
};


async function main()
{
    banner();

    const choosenTemplate = await select({
        message: 'What do you want to create?',
        choices: Object.entries(TEMPLATES).map(([key, t]) => ({
            name: t.name,
            value: key,
        })),
    });
    const template = TEMPLATES[choosenTemplate];
    const projectName = await input({
        message: 'Please enter name of project (directory):',
        validate: (v) => v && v.trim().length > 0 ? true : 'Please enter name of project (directory):',
    });
    const projectDir = path.resolve(process.cwd(), projectName);

    if (dirExists(projectDir))
    {
        console.log(chalk.red(`\n✖ Directory "${ projectName }" already exists.`));
        process.exit(1);
    }

    console.log(chalk.cyan(`\n› Creating ${ template.name } in ${ projectName } ...`));

    const degitCmd = `npx degit ${ template.repo } "${ projectName }"`;

    if (!runCommand(degitCmd)) process.exit(1);

    const pkgPath = path.join(projectDir, 'package.json');

    if (fs.existsSync(pkgPath))
    {
        try
        {
            const packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const npmName = toNpmName(projectName) || 'rino-app';

            if (packageJson.name !== npmName)
            {
                packageJson.name = npmName;
                fs.writeFileSync(pkgPath, JSON.stringify(packageJson, null, 2));
            }
        }
        catch (e)
        {
            console.log(chalk.yellow('! Skipped package.json rename (parse/write failed)'));
        }
    }

    // This is blocked for now as only work for npm
    /*
    console.log(chalk.cyan('\n› Installing dependencies...'));
    for (const cmd of template.post)
    {
        if (!run(cmd, { cwd: projectDir })) process.exit(1);
    }
    */

    console.log(`\n${ chalk.green('Setup complete!') }

${ chalk.blue('Repos:') }
  ${ chalk.blue('• https://github.com/rinojs') }
  ${ chalk.blue('• https://github.com/rinojs/rinojs') }

${ chalk.blueBright('Next steps:') }
  ${ chalk.green(`cd ${ projectName }`) }
  ${ template.next.map((l) => chalk.green(l)).join('\n  ') }
`);


}

main().catch((err) =>
{
    console.error(chalk.red('Unexpected error:\n'), err);
    process.exit(1);
});