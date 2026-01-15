import path from 'path'

import fs from 'fs-extra'

import type { RollbackContext } from '../utils/rollback'

export function write(file: string, content: string, baseDir: string, rollbackCtx?: RollbackContext) {
  const target = path.join(baseDir, file)

  fs.ensureDirSync(path.dirname(target))
  fs.writeFileSync(target, content)

  rollbackCtx?.createdFiles.push(target)

  console.log(`Arquivo criado: ${target}`)
}
