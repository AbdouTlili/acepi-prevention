const { execSync } = require('child_process')

let GIT_COMMIT = 'dev'
try {
  GIT_COMMIT = execSync('git rev-parse --short HEAD').toString().trim()
} catch {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: GIT_COMMIT,
  },
}

module.exports = nextConfig
