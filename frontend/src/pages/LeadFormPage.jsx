import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Label from '../components/ui/Label';

const statusOptions = ['new','contacted','qualified','lost','won'];
const sourceOptions = ['website','facebook_ads','google_ads','referral','events','other'];

const empty = { first_name:'', last_name:'', email:'', phone:'', company:'', city:'', state:'', source:'other', status:'new', score:0, lead_value:0, last_activity_at:'', is_qualified:false };

export default function LeadFormPage({ mode }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(mode==='edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (mode==='edit' && id) {
        try {
          const data = await api.get(`/leads/${id}`);
          setForm({ ...empty, ...data, last_activity_at: data.last_activity_at ? data.last_activity_at.substring(0,16) : '' });
        } catch(e) { setError(e.message); }
        finally { setLoading(false); }
      }
    }
    load();
  }, [mode, id]);

  function change(k, v) { setForm(f=> ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      const payload = { ...form };
      if (payload.last_activity_at) payload.last_activity_at = new Date(payload.last_activity_at);
      else payload.last_activity_at = null;
      if (mode==='create') await api.post('/leads', payload); else await api.put(`/leads/${id}`, payload);
      nav('/leads');
    } catch(e) { setError(e.message); } finally { setSaving(false); }
  }

  if (loading) return <div>Loading...</div>;

  return (
  <div className="max-w-3xl animate-[fadeIn_180ms_ease-out]">
      <h1 className="text-2xl font-semibold mb-4">{mode==='create'? 'New Lead' : 'Edit Lead'}</h1>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <form onSubmit={submit} className="grid gap-4 grid-cols-1 md:grid-cols-2 bg-white border rounded-lg p-6 shadow-sm">
        <Field label="First Name"><Input required value={form.first_name} onChange={e=>change('first_name', e.target.value)} /></Field>
        <Field label="Last Name"><Input required value={form.last_name} onChange={e=>change('last_name', e.target.value)} /></Field>
        <Field label="Email"><Input type="email" required value={form.email} onChange={e=>change('email', e.target.value)} /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={e=>change('phone', e.target.value)} /></Field>
        <Field label="Company"><Input value={form.company} onChange={e=>change('company', e.target.value)} /></Field>
        <Field label="City"><Input value={form.city} onChange={e=>change('city', e.target.value)} /></Field>
        <Field label="State"><Input value={form.state} onChange={e=>change('state', e.target.value)} /></Field>
        <Field label="Source"><Select value={form.source} onChange={e=>change('source', e.target.value)}>{sourceOptions.map(o=> <option key={o}>{o}</option>)}</Select></Field>
        <Field label="Status"><Select value={form.status} onChange={e=>change('status', e.target.value)}>{statusOptions.map(o=> <option key={o}>{o}</option>)}</Select></Field>
        <Field label="Score"><Input type="number" min={0} max={100} value={form.score} onChange={e=>change('score', Number(e.target.value))} /></Field>
        <Field label="Lead Value"><Input type="number" value={form.lead_value} onChange={e=>change('lead_value', Number(e.target.value))} /></Field>
        <Field label="Last Activity (local)"><Input type="datetime-local" value={form.last_activity_at} onChange={e=>change('last_activity_at', e.target.value)} /></Field>
        <div className="flex items-center gap-2">
          <input id="is_qualified" type="checkbox" checked={form.is_qualified} onChange={e=>change('is_qualified', e.target.checked)} />
          <Label htmlFor="is_qualified">Qualified?</Label>
        </div>
        <div className="md:col-span-2 flex gap-2 mt-2">
          <Button disabled={saving} type="submit">{saving? 'Saving...' : 'Save'}</Button>
          <Button type="button" onClick={()=>nav('/leads')} variant="secondary">Cancel</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="text-sm flex flex-col gap-1">
      <span className="text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}
