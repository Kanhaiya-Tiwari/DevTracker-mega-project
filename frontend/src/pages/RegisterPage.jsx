import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";

export default function RegisterPage({ onSubmit, onSwitch, loading, error }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative min-h-screen grid place-items-center px-4 bg-slate-950 overflow-hidden">
      <div className="float-soft absolute top-8 -left-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="float-soft absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="glass-card relative w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-300">Create your daily execution system.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ name, email, password });
          }}
        >
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
        </form>

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <button type="button" onClick={onSwitch} className="mt-4 text-sm text-violet-300 hover:text-violet-200">
          Already have account? Login
        </button>
      </div>
    </div>
  );
}
