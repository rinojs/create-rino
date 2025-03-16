#!/usr/bin/env node

import { execSync } from 'child_process';
import { input } from '@inquirer/prompts';
import fs from 'fs';
import chalk from 'chalk';

async function runCommand (command)
{
    try
    {
        execSync(`${command}`, { stdio: 'inherit' });
    }
    catch (error)
    {
        console.error(`Error: ${command}\n`, error);
        return false;
    }

    return true;
}

async function main ()
{
    try
    {
        console.log(`${chalk.redBright.bgBlack(`
██████╗ ██╗███╗   ██╗ ██████╗         ██╗███████╗
██╔══██╗██║████╗  ██║██╔═══██╗        ██║██╔════╝
██████╔╝██║██╔██╗ ██║██║   ██║        ██║███████╗
██╔══██╗██║██║╚██╗██║██║   ██║   ██   ██║╚════██║
██║  ██║██║██║ ╚████║╚██████╔╝██╗╚█████╔╝███████║
╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝ ╚════╝ ╚══════╝
`)}

${chalk.white.bold('Become a sponsor & support Rino.js!')}
${chalk.white('https://github.com/sponsors/opdev1004')}
        `);

        const projectName = await input({ message: 'Please enter name of project (directory):' });
        const gitCloneCommand = `git clone --depth 1 https://github.com/rinojs/create-rino-template.git ${projectName}`
        const setupCommand = `cd ${projectName} && git remote remove origin && npm install`
        console.log(`Cloning the repository with name: ${projectName}`);

        let result = await runCommand(gitCloneCommand);

        if (!result) process.exit(1);

        console.log(`Cloning is successful`);
        console.log(`Setting up ${projectName}`);

        const packageJsonPath = `./${projectName}/package.json`;
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        packageJson.name = projectName;

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));

        result = await runCommand(setupCommand);

        if (!result) process.exit(1);

        console.log(`Setting up is successful`);
        console.log(`
Github: https://github.com/rinojs/rinojs

Start your development:
cd ${projectName} && npm run dev

        `);
    }
    catch (error)
    {
        console.error(`Error: `, error);
    }
}

main();