'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-white mb-4">NQ Slicks</h1>
        <p className="text-gray-400 mb-12">Tyre shop system</p>

        <div className="grid grid-cols-1 gap-6">
          <Link href="/sales/new">
            <div className="bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-lg cursor-pointer">
              <h2 className="text-2xl font-bold">NEW SALE</h2>
              <p className="text-blue-100 mt-2">Start a new transaction</p>
            </div>
          </Link>

          <div className="bg-gray-800 text-gray-400 p-8 rounded-lg opacity-50">
            <h2 className="text-2xl font-bold">INVENTORY</h2>
            <p className="text-gray-500 mt-2">Coming soon...</p>
          </div>

          <div className="bg-gray-800 text-gray-400 p-8 rounded-lg opacity-50">
            <h2 className="text-2xl font-bold">DASHBOARD</h2>
            <p className="text-gray-500 mt-2">Coming soon...</p>
          </div>
        </div>
      </div>
    </main>
  )
}
