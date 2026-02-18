'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserRow {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  createdAt: string
  _count: { taxReturns: number }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') {
      if (!session.user.isAdmin) {
        router.push('/')
        return
      }
      fetchUsers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) {
        setError('Failed to load users')
        return
      }
      const { users } = await res.json()
      setUsers(users)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
              TaxFlow
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-600">Admin</span>
          </div>
          <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
            ← Back to App
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Returns</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">{user.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{user._count.taxReturns}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
