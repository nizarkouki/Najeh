import Image from 'next/image';

export default function Home() {
  return (
    <header className="">
      <Image src="/logo.png" width={120} height={120} alt='Najeh logo'/>
      <div>
        <button>Login</button>
        
      </div>
    </header>
  );
}
