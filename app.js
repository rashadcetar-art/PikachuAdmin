/* Supabase project settings are supplied at deploy time through Vercel environment variables. */
const SUPABASE_URL = window.PIKACHU_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.PIKACHU_SUPABASE_ANON_KEY || '';
const $ = (id) => document.getElementById(id);
let client = null, currentFilter = 'all', devices = [];
const labels = {pending:'Menunggu', approved:'Disetujui', rejected:'Ditolak'};
function show(id, yes){$(id).classList.toggle('hidden',!yes)}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function message(id,text,isError=false){$(id).textContent=text;$(id).classList.toggle('error',isError)}
function setup(){
 if(!window.supabase){$('configNotice').textContent='Library Supabase gagal dimuat. Periksa koneksi internet lalu muat ulang.';show('configNotice',true);return}
 if(!SUPABASE_URL || !SUPABASE_ANON_KEY){$('configNotice').textContent='Konfigurasi Supabase belum diisi. Ikuti README dan isi environment variables di Vercel sebelum login.';show('configNotice',true);return}
 client=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 client.auth.getSession().then(({data})=>{if(data.session) enter(data.session.user);});
 client.auth.onAuthStateChange((_event,session)=>{if(session)enter(session.user);else leave()});
}
async function enter(user){show('loginView',false);show('appView',true);show('logoutBtn',true);$('signedInAs').textContent=user.email||'Admin';await loadDevices()}
function leave(){show('appView',false);show('loginView',true);show('logoutBtn',false)}
async function loadDevices(){if(!client)return;message('tableMessage','Memuat…');const {data,error}=await client.from('devices').select('*').order('created_at',{ascending:false});if(error){message('tableMessage',error.message,true);$('deviceRows').innerHTML='<tr><td colspan="5" class="empty">Gagal memuat data. Pastikan akun sudah terdaftar sebagai admin dan SQL sudah dijalankan.</td></tr>';return}devices=data||[];render()}
function render(){const count=s=>devices.filter(d=>d.status===s).length;$('totalCount').textContent=devices.length;$('pendingCount').textContent=count('pending');$('approvedCount').textContent=count('approved');$('rejectedCount').textContent=count('rejected');const q=$('searchInput').value.toLowerCase();const rows=devices.filter(d=>(currentFilter==='all'||d.status===currentFilter)&&(`${d.device_id} ${d.owner||''}`).toLowerCase().includes(q));$('deviceRows').innerHTML=rows.length?rows.map(d=>`<tr><td>${escapeHtml(d.device_id)}</td><td>${escapeHtml(d.owner||'—')}</td><td><span class="pill ${d.status}">${labels[d.status]||d.status}</span></td><td>${d.checkin_at?new Date(d.checkin_at).toLocaleString('id-ID'):'—'}</td><td><div class="actions"><button class="mini good" data-action="approved" data-id="${d.id}">Approve</button><button class="mini bad" data-action="rejected" data-id="${d.id}">Reject</button><button class="mini" data-action="checkin" data-id="${d.id}">Check-in</button><button class="mini bad" data-action="delete" data-id="${d.id}">Hapus</button></div></td></tr>`).join(''):'<tr><td colspan="5" class="empty">Belum ada perangkat yang cocok.</td></tr>';message('tableMessage',`${rows.length} perangkat ditampilkan.`)}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;message('loginError','Memeriksa akun…');const {error}=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});message('loginError',error?error.message:'',!!error)});
$('logoutBtn').addEventListener('click',async()=>{if(client)await client.auth.signOut()});
$('addForm').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;const device_id=$('newDeviceId').value.trim();if(!device_id)return;const {error}=await client.from('devices').insert({device_id,owner:$('newOwner').value.trim()||null,status:'pending'});if(error){message('addMessage',error.message,true);return}$('addForm').reset();message('addMessage','Device ID berhasil ditambahkan.');await loadDevices()});
$('deviceRows').addEventListener('click',async e=>{const b=e.target.closest('button[data-action]');if(!b||!client)return;const id=b.dataset.id,action=b.dataset.action;if(action==='delete'){if(!confirm('Hapus perangkat ini?'))return;const {error}=await client.from('devices').delete().eq('id',id);if(error)message('tableMessage',error.message,true)}else{const update=action==='checkin'?{checkin_at:new Date().toISOString()}:{status:action};const {error}=await client.from('devices').update(update).eq('id',id);if(error)message('tableMessage',error.message,true)}await loadDevices()});
$('searchInput').addEventListener('input',render);$('refreshBtn').addEventListener('click',loadDevices);document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{currentFilter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()}));setup();
