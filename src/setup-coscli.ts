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
    const bucket = core.getInput('bucket', inputOptions)
    const region = core.getInput('region', inputOptions)
    const sessionToken = core.getInput('session-token')
    const args1 = [
      'config',
      'set',
      '--secret_id',
      secretId,
      '--secret_key',
      secretKey
    ]
    if (sessionToken) {
      args1.push('--session_token', sessionToken)
    }
    fs.closeSync(fs.openSync(path.join(os.homedir(), '.cos.yaml'), 'w'))
    core.info('create empty file .cos.yaml file')
    let exitCode = await exec.exec('coscli', args1)
    if (exitCode === 0) {
      core.info('coscli config set is OK')
    } else {
      core.warning('coscli config set failed')
    }
    const args2 = ['config', 'add', '-b', bucket, '-r', region]
    exitCode = await exec.exec('coscli', args2)
    if (exitCode === 0) {
      core.info('coscli config add is OK')
    } else {
      core.warning('coscli config add failed')
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
