import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as installer from './installer'
import * as io from '@actions/io'

async function run(): Promise<void> {
  try {
    // download
    const version = core.getInput('coscli-version')
    await installer.installCosCli(version)
    core.info('coscli is successfully installed')

    // config
    const inputOptions: core.InputOptions = {required: true}
    const region = core.getInput('region', inputOptions)
    const secretId = core.getInput('secret-id', inputOptions)
    const secretKey = core.getInput('secret-key', inputOptions)
    const bucket = core.getInput('bucket', inputOptions)
    const sessionToken = core.getInput('session-token')
    const args = [
      'config',
      'add',
      '--region',
      region,
      '--secret-id',
      secretId,
      '--secret-key',
      secretKey,
      '--bucket',
      bucket
    ]
    if (sessionToken) {
      args.push('--session-token', sessionToken)
    }
    const emptyFile = await exec.exec('echo "" > ~/.cos.yaml')
    core.info(`create empty file with exit code ${emptyFile}`)
    const exitCode = await exec.exec('coscli', args)
    if (exitCode === 0) {
      core.info('coscli config is OK')
    } else {
      core.warning('coscli config failed')
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
