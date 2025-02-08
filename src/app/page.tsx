"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from "react";

// TEST CODE / BOILERPLATE CODE!!
// see /perplexity

// set up
const supabaseUrl = 'https://zxrvcgocqiuorvpezzer.supabase.co'
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cnZjZ29jcWl1b3J2cGV6emVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMzM2MTksImV4cCI6MjA1NDYwOTYxOX0.BTVPHNFKC4dlcUmKPQryfwCViaIgRT00Pu-D56vDlyM'
const supabase = createClient(supabaseUrl, PUBLIC_ANON_KEY)


function AnimalDisplay({ refreshTrigger }: { refreshTrigger?: number }) {
  // Define an interface for the animal structure
  interface Animal {
    id: number;
    // add other fields that your animals have
    species?: string;
  }

  const [animals, setAnimals] = useState<Animal[]>([])

  useEffect(() => {
    const fetchAnimals = async () => {
      const { data, error } = await supabase
      .from('animals')
      .select()

      if (error) {
        console.error('Error fetching animals:', error)
      } else {
        setAnimals(data)
      }
    }

    fetchAnimals()
  }, [refreshTrigger]) // Re-run when refreshTrigger changes

  return (
    <div>
      <h1>Animals</h1>
      <ul>
        {animals.map((animal) => (
          <h3 key={animal.id}>{animal.species}</h3>
        ))}
      </ul>
    </div>
  );
}

function AnimalForm({ onSuccessHandler }: { onSuccessHandler: () => void }) {
  const [species, setSpecies] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('animals')
      .insert([
        { species: species }
      ])

    if (error) {
      console.error('Error adding animal:', error)
    } else {
      setSpecies('') // Reset form
      onSuccessHandler()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={species}
        onChange={(e) => setSpecies(e.target.value)}
        placeholder="Enter species"
      />
      <button type="submit">Add Animal</button>
    </form>
  )
}

function Animals() {
  const [refreshCounter, setRefreshCounter] = useState(0)

  const handleFormSuccess = () => {
    setRefreshCounter(prev => prev + 1)
  }

  return (
    <div>
      <AnimalDisplay refreshTrigger={refreshCounter} />
      <AnimalForm onSuccessHandler={handleFormSuccess} />
    </div>
  )
}

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <Animals />

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
