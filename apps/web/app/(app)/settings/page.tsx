import { strapi, unwrapCollection } from '@/lib/strapi';

async function getCompany() {
  const response = await strapi.get<{ data: { id: number; attributes: { name: string; taxId: string; country: string; certAlias?: string; certNotAfter?: string } }[] }>('/api/companies');
  const companies = unwrapCollection(response);
  return companies[0];
}

export default async function SettingsPage() {
  const company = await getCompany();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Ajustes</h1>
        <p className="text-sm text-neutral-400">Datos fiscales y certificados de la compañía.</p>
      </header>
      {company ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-neutral-500">Nombre</dt>
              <dd className="text-lg text-white">{company.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-neutral-500">NIF</dt>
              <dd className="text-lg text-white">{company.taxId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-neutral-500">País</dt>
              <dd className="text-lg text-white">{company.country}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-neutral-500">Certificado</dt>
              <dd className="text-lg text-white">{company.certAlias ?? 'No cargado'}</dd>
              <p className="text-xs text-neutral-500">Caduca: {company.certNotAfter ?? '—'}</p>
            </div>
          </dl>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Configura tu compañía en Strapi.</p>
      )}
    </div>
  );
}
