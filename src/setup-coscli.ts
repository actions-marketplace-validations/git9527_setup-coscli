import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as installer from './installer'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

async function run(): Promise<void> {
  try {
    // download
    const version = core.getInput('coscli-version')
    await installer.installCosCli(version)
    core.info('coscli is successfully installed')

    // config
    const inputOptions: core.InputOptions = {required: true}
    const secretId = core.getInput('secret-id', inputOptions)
    const secretKey = core.getInput('secret-key', inputOptions)
    const sessionToken = core.getInput('session-token')
    const args = [
      'config',
      'set',
      '--secret_id',
      secretId,
      '--secret_key',
      secretKey
    ]
    if (sessionToken) {
      args.push('--session_token', sessionToken)
    }
    fs.closeSync(fs.openSync(path.join(os.homedir(), '.cos.yaml'), 'w'))
    core.info('create empty file .cos.yaml file')
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
