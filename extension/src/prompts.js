/**
 * Quasar App Extension prompts script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/prompts-api
 *
 * Inquirer prompts
 * (answers are available as "api.prompts" in the other scripts)
 * https://www.npmjs.com/package/inquirer#question
 *
 * Example:

  return [
    {
      name: 'name',
      type: 'input',
      required: true,
      message: 'Quasar CLI Extension name (without prefix)',
    },
    {
      name: 'preset',
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [
        {
          name: 'Install script',
          value: 'install'
        },
        {
          name: 'Prompts script',
          value: 'prompts'
        },
        {
          name: 'Uninstall script',
          value: 'uninstall'
        }
      ]
    }
  ]

 */

export default async function (api) {
  return [
    {
      name: "apiSet",
      type: "list",
      message: "Choose features you need: ",
      choices: [
        {
          name: "Router API & Render API [ RECOMMENDED ]",
          short: "Router & Render",
          value: "routerRenderApi",
        },
        {
          name: "Router API [ ADVANCED ]",
          short: "Router",
          value: "routerApi",
        },
        {
          name: "Render API [ ADVANCED ]",
          short: "Render",
          value: "renderApi",
        },
      ],
    },
  ];
}
