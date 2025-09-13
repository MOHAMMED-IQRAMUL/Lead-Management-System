import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Card from '../components/ui/Card';
import TableSkeleton from '../components/ui/TableSkeleton';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const statusOptions = ['new','contacted','qualified','lost','won'];
const sourceOptions = ['website','facebook_ads','google_ads','referral','events','other'];

function ActionsCellRenderer({ data, onDelete }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 justify-center">
      <Button onClick={()=>navigate(`/leads/${data._id}/edit`)} variant="secondary" className="h-8 px-3">
        <span className="flex items-center gap-1"><FiEdit2 /> Edit</span>
      </Button>
      <Button onClick={()=>onDelete?.(data._id)} variant="danger" className="h-8 px-3">
        <span className="flex items-center gap-1"><FiTrash2 /> Delete</span>
      </Button>
    </div>
  );
}

export default function LeadsPage() {
  const gridRef = useRef(null);
  const [data, setData] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page:1, totalPages:1, total:0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [waking, setWaking] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const statusFilter = searchParams.get('status_equals') || '';
  const sourceFilter = searchParams.get('source_equals') || '';
  const emailContains = searchParams.get('email_contains') || '';
  const scoreBetween = searchParams.get('score_between') || '';
  const isQualified = searchParams.get('is_qualified_equals') || '';
  const createdBetween = searchParams.get('created_at_between') || '';

  const buildQuery = () => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (statusFilter) qs.set('status_equals', statusFilter);
    if (sourceFilter) qs.set('source_equals', sourceFilter);
    if (emailContains) qs.set('email_contains', emailContains);
    if (scoreBetween) qs.set('score_between', scoreBetween);
    if (isQualified) qs.set('is_qualified_equals', isQualified);
    if (createdBetween) qs.set('created_at_between', createdBetween);
    return qs.toString();
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/leads?${buildQuery()}`);
      setData(res.data);
      setPageInfo({ page: res.page, totalPages: res.totalPages, total: res.total });
    } catch (err) {
      if (err?.code === 'BACKEND_OFFLINE') {
        setWaking(true);
        const deadline = Date.now() + 30000;
        while (Date.now() < deadline) {
          const ok = await api.health();
          if (ok) break;
          await new Promise(r => setTimeout(r, 1500));
        }
        setWaking(false);
        try {
          const res = await api.get(`/leads?${buildQuery()}`);
          setData(res.data);
          setPageInfo({ page: res.page, totalPages: res.totalPages, total: res.total });
          setError(null);
        } catch (e2) {
          setError(e2.message);
        }
      } else {
        setError(err.message);
      }
    }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, sourceFilter, emailContains, scoreBetween, isQualified, createdBetween]);

  useEffect(() => { load(); }, [load]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  }

  function changePage(p) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  }

  function changeLimit(l) {
    const next = new URLSearchParams(searchParams);
    next.set('limit', String(l));
    next.set('page', '1');
    setSearchParams(next);
  }

  function resetFilters() {
    const keep = new URLSearchParams();
    keep.set('page', '1');
    setSearchParams(keep);
  }

  const delLead = useCallback(async (id) => {
    if (!window.confirm('Delete lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      load();
    } catch(e) { alert(e.message); }
  }, [load]);

  const columns = useMemo(() => ([
    { headerName: 'Name', valueGetter: p => `${p.data.first_name} ${p.data.last_name}`, flex: 1 },
    { headerName: 'Email', field: 'email', flex: 1 },
    { headerName: 'Status', field: 'status', width: 130 },
    { headerName: 'Source', field: 'source', width: 150 },
    { headerName: 'Score', field: 'score', width: 110 },
    { headerName: 'Value', field: 'lead_value', width: 120 },
    { headerName: 'Actions', width: 200, cellRenderer: ActionsCellRenderer, cellRendererParams: { onDelete: delLead } },
  ]), [delLead]);

  const onGridReady = useCallback((params) => {
    gridRef.current = params.api;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
  <Link to="/leads/new"><Button><span className="flex items-center gap-2"><FiPlus /> New Lead</span></Button></Link>
      </div>
      <Card className="p-4 grid gap-3 md:grid-cols-7">
        <div>
          <div className="text-xs block mb-1">Status</div>
          <Select value={statusFilter} onChange={e=>updateFilter('status_equals', e.target.value)}>
            <option value="">All</option>
            {statusOptions.map(s=> <option key={s}>{s}</option>)}
          </Select>
        </div>
        <div>
          <div className="text-xs block mb-1">Source</div>
          <Select value={sourceFilter} onChange={e=>updateFilter('source_equals', e.target.value)}>
            <option value="">All</option>
            {sourceOptions.map(s=> <option key={s}>{s}</option>)}
          </Select>
        </div>
        <div>
          <div className="text-xs block mb-1">Email contains</div>
          <Input value={emailContains} onChange={e=>updateFilter('email_contains', e.target.value)} placeholder="john" />
        </div>
        <div>
          <div className="text-xs block mb-1">Score min</div>
          <Input type="number" min={0} max={100} value={scoreBetween.split(',')[0] || ''}
                 onChange={e=>{
                   const min = e.target.value;
                   const max = scoreBetween.split(',')[1] || '';
                   updateFilter('score_between', min || max ? `${min || 0},${max || 100}` : '');
                 }} placeholder="0" />
        </div>
        <div>
          <div className="text-xs block mb-1">Score max</div>
          <Input type="number" min={0} max={100} value={scoreBetween.split(',')[1] || ''}
                 onChange={e=>{
                   const max = e.target.value;
                   const min = scoreBetween.split(',')[0] || '';
                   updateFilter('score_between', min || max ? `${min || 0},${max || 100}` : '');
                 }} placeholder="100" />
        </div>
        <div>
          <div className="text-xs block mb-1">Created from</div>
          <Input type="date" value={createdBetween.split(',')[0] || ''}
                 onChange={e=>{
                   const from = e.target.value;
                   const to = createdBetween.split(',')[1] || '';
                   updateFilter('created_at_between', from || to ? `${from || to},${to || from}` : '');
                 }} />
        </div>
        <div>
          <div className="text-xs block mb-1">Created to</div>
          <Input type="date" value={createdBetween.split(',')[1] || ''}
                 onChange={e=>{
                   const to = e.target.value;
                   const from = createdBetween.split(',')[0] || '';
                   updateFilter('created_at_between', from || to ? `${from || to},${to || from}` : '');
                 }} />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isQualified === 'true'} onChange={e=>updateFilter('is_qualified_equals', e.target.checked ? 'true' : '')} />
            Qualified
          </label>
          <Button variant="secondary" type="button" onClick={resetFilters} className="ml-auto">Reset</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3"><div className="text-xs text-gray-500">Total</div><div className="text-xl font-semibold">{pageInfo.total}</div></Card>
        <Card className="p-3"><div className="text-xs text-gray-500">Page</div><div className="text-xl font-semibold">{pageInfo.page} / {pageInfo.totalPages}</div></Card>
  <Card className="p-3"><div className="text-xs text-gray-500">Per page</div><div className="text-xl font-semibold">{limit}</div></Card>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading || waking ? (
        <div>
          <TableSkeleton rows={6} cols={6} />
          {waking && <div className="text-center text-sm text-gray-600 mt-3">Waking up backend on Render…</div>}
        </div>
      ) : (
        data.length === 0 ? (
          <Card className="p-10 text-center text-sm text-gray-600">
            <div className="mb-2 font-medium text-gray-800">No leads to display</div>
            <div>Try adjusting filters or <Link to="/leads/new" className="underline">create a new lead</Link>.</div>
          </Card>
        ) : (
      <div className="ag-theme-alpine border rounded-lg bg-white shadow-sm animate-[fadeIn_150ms_ease-out]" style={{height: 520, width: '100%'}}>
            <AgGridReact
              rowData={data}
              columnDefs={columns}
        pagination={false}
        overlayNoRowsTemplate="<span class='text-gray-600'>No rows to show</span>"
        onGridReady={onGridReady}
        getRowId={(p)=>p.data._id}
              rowHeight={42}
              headerHeight={40}
              theme="legacy"
            />
          </div>
        )
      )}
      <div className="flex items-center gap-3 text-sm">
        <Button disabled={page<=1} onClick={()=>changePage(page-1)} variant="secondary">Prev</Button>
        <span>Page {pageInfo.page} / {pageInfo.totalPages} ({pageInfo.total} total)</span>
        <Button disabled={pageInfo.page>=pageInfo.totalPages} onClick={()=>changePage(page+1)} variant="secondary">Next</Button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-gray-500">Show</span>
          <Select value={String(limit)} onChange={e=>changeLimit(Number(e.target.value))} className="w-[90px]">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
