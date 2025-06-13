import fs from 'fs'
import { styleText } from 'node:util'

import { resolvePath } from '../utils.js'

const buildDir = resolvePath('dist')

let totalFileCount = 0
let deletedFileCount = 0

function eachFiles(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const path = resolvePath(file, dir)
      if (fs.statSync(path).isDirectory()) {
        eachFiles(path)
      } else {
        totalFileCount++
      }
    })
  }
}

function deleteFiles(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const path = resolvePath(file, dir)
      if (fs.statSync(path).isDirectory()) {
        deleteFiles(path)
      } else {
        fs.unlinkSync(path)
        deletedFileCount++
        if (process.stdout.isTTY && typeof process.stdout.clearLine === 'function') {
          process.stdout.clearLine(0);
        } else {
          // Fallback for non-TTY environments like CI
          process.stdout.write('\n');
        }
        process.stdout.cursorTo(0)
        const percent = `${Math.round(deletedFileCount / totalFileCount * 100)}%`
        process.stdout.write(`${styleText('blue', `${percent}(${deletedFileCount}/${totalFileCount}): ${file}`)}`, 'utf-8')
      }
    })
    fs.rmdirSync(dir)
  }
}

function clean() {
  eachFiles(buildDir)
  deleteFiles(buildDir)

  console.log(styleText('green', '\n\n✔ Clean successfully.\n'))
}

clean()
