import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="flex justify-between items-center">
          <div className="text-2xl font-bold">MDVA</div>
          <div className="space-x-3">
            <Link to="/login" className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">Login</Link>
            <Link to="/register" className="px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-600">Register</Link>
          </div>
        </header>

        <main className="mt-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Modern Demo for Web App Security Education
            </h1>
            <p className="mt-4 text-gray-300 text-lg">
              MDVA is a modern vulnerable application built for hands-on learning. Created by <span className="font-semibold">Nikko Enggaliano</span> for educational purposes.
            </p>
            <div className="mt-8 space-x-3">
              <Link to="/login" className="px-5 py-3 rounded bg-indigo-500 hover:bg-indigo-600">Get Started</Link>
              <a href="https://nikko.id" target="_blank" rel="noreferrer" className="px-5 py-3 rounded bg-white/10 hover:bg-white/20">Learn More</a>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              What is MDVA? MDVA is designed to demonstrate common security pitfalls such as SQL Injection, XSS, CSRF, IDOR, SSRF, and more in a realistic full-stack environment.
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop" alt="app preview" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-indigo-600 text-white px-4 py-2 rounded shadow-lg text-sm">
              Built with React, Express, MySQL
            </div>
          </div>
        </main>

        <section className="mt-24 grid md:grid-cols-3 gap-6">
          {["Realistic", "Hands-on", "Patchable"].map((title, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-6 ring-1 ring-white/10">
              <div className="text-lg font-semibold">{title}</div>
              <div className="text-gray-300 mt-2 text-sm">
                Explore vulnerabilities in a realistic app, practice exploiting and then patching them step by step.
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-20 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} MDVA — Created by Nikko Enggaliano for educational purposes.
        </footer>
      </div>
    </div>
  )
}


