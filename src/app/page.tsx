"use client";

import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <button 
        onClick={() => router.push('/perplexity')}
        className={styles.button}
      >
        Take me to Perplexity
      </button>
    </div>
  );
}
