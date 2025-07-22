import { homedir } from 'os'
import path, { join } from 'path'
import { projectRoot } from '../env'

const secretsDir = path.join(projectRoot, 'secrets')
const sshDir = join(homedir(), '.ssh')

export const secretsConfig = {
	secretsDir,
	secretSourceDir: path.join(secretsDir, 'files'),
	secretDecDir: path.join(secretsDir, 'files-dec'),
	encryptedFile: path.join(secretsDir, 'secrets.enc'),
	secretKey: process.env.SECRETS_KEY || '',
	sshDir,
}