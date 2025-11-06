import React from 'react'

const ChooseRole = () => {
  const adminUrl = import.meta.env.VITE_ADMIN_URL || ''
  const doctorUrl = import.meta.env.VITE_DOCTOR_URL || ''
  const pharmacistUrl = import.meta.env.VITE_PHARMACIST_URL || ''
  const patientUrl = import.meta.env.VITE_FRONTEND_URL || ''
  const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

  const open = (url, fallback) => {
    if (url) {
      // open external deployed app
      window.location.href = url
    } else if (fallback) {
      window.location.href = fallback
    } else {
      alert('Dashboard URL not configured. Please ask the administrator.')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-xl p-8 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Choose your dashboard</h2>
        <p className="mb-6 text-sm text-gray-600">Select the role you want to sign in as. If your project's live URL is configured, you'll be redirected to that app's login page.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => open(patientUrl, '/login')} className="px-4 py-3 rounded-lg bg-primary text-white">Patient (User)</button>
          <button onClick={() => open(doctorUrl, '')} className="px-4 py-3 rounded-lg bg-indigo-600 text-white">Doctor</button>
          <button onClick={() => open(pharmacistUrl, '')} className="px-4 py-3 rounded-lg bg-emerald-600 text-white">Pharmacist</button>
          <button onClick={() => open(adminUrl, '')} className="px-4 py-3 rounded-lg bg-gray-800 text-white">Admin</button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Note: Configure the following Vite environment variables in each deployed frontend to make those buttons go to the live apps:</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>VITE_ADMIN_URL</code></li>
            <li><code>VITE_DOCTOR_URL</code></li>
            <li><code>VITE_PHARMACIST_URL</code></li>
            <li><code>VITE_FRONTEND_URL</code> (optional — usually this app)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ChooseRole
