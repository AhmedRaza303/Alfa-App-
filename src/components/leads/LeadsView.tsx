import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import { FlyerCategory, Lead } from '../../types';
import { FLYER_CATEGORIES, getFlyerCategoryLabel } from '../../utils/flyerCategories';
import {
  ClipboardList,
  Plus,
  X,
  User,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  Trash2,
  Search,
  Check,
  Pencil
} from 'lucide-react';

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  accidentType: FlyerCategory | '';
  notes: string;
};

const emptyForm: FormState = {
  fullName: '',
  phone: '',
  email: '',
  accidentType: '',
  notes: ''
};

export const LeadsView: React.FC = () => {
  const { currentUser, language, leads, addLead, updateLead, deleteLead } = useApp();
  const { isExpandedShell } = useShellLayout();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FlyerCategory | 'all'>('all');

  const visibleLeads = useMemo(() => {
    if (!currentUser) return [];
    let list =
      currentUser.role === 'Admin'
        ? [...leads]
        : leads.filter((l) => l.createdByUserId === currentUser.id);

    if (typeFilter !== 'all') {
      list = list.filter((l) => l.accidentType === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [leads, currentUser, search, typeFilter]);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'Admin';
  const canManageLeads = !isAdmin;

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      next.fullName = 'Enter full name (min 2 characters).';
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 7) {
      next.phone = 'Enter a valid phone number.';
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      next.email = 'Enter a valid email.';
    }
    if (!form.accidentType) {
      next.accidentType = 'Select type of accident.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingLeadId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      accidentType: form.accidentType as FlyerCategory,
      notes: form.notes.trim()
    };
    if (editingLeadId) {
      updateLead(editingLeadId, payload);
    } else {
      addLead(payload);
    }
    closeForm();
  };

  const openCreateForm = () => {
    if (!canManageLeads) return;
    setEditingLeadId(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (lead: Lead) => {
    if (!canManageLeads) return;
    setEditingLeadId(lead.id);
    setForm({
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      accidentType: lead.accidentType,
      notes: lead.notes || ''
    });
    setErrors({});
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 pb-6 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs space-y-2">
          {canManageLeads && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New lead
              </button>
            </div>
          )}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, email..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-400"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FlyerCategory | 'all')}
            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">All accident types</option>
            {FLYER_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {getFlyerCategoryLabel(c.id, language)}
              </option>
            ))}
          </select>
        </section>

        {/* List */}
        <section className="space-y-2">
          {visibleLeads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center px-4">
              <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No leads yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {isAdmin
                  ? 'Marketers have not captured any leads yet.'
                  : 'Tap New lead to add your first contact.'}
              </p>
              {canManageLeads && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold cursor-pointer"
                >
                  Add lead
                </button>
              )}
            </div>
          ) : (
            visibleLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                language={language}
                showOwner={isAdmin}
                canManage={canManageLeads}
                onEdit={() => openEditForm(lead)}
                onDelete={() => deleteLead(lead.id)}
              />
            ))
          )}
        </section>
      </div>

      {/* Create / Edit Lead modal — marketers only */}
      {formOpen && canManageLeads && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={closeForm} />
          <div
            className={`relative w-full bg-white border border-slate-200 shadow-2xl z-10 flex flex-col overflow-hidden ${
              isExpandedShell
                ? 'max-w-md rounded-3xl max-h-[90vh]'
                : 'max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92dvh]'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <h2 className="text-sm font-bold text-slate-900">
                {editingLeadId ? 'Edit lead' : 'New lead'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="w-8 h-8 rounded-xl text-slate-400 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
              <Field
                label="Full name"
                required
                error={errors.fullName}
                icon={<User className="w-3.5 h-3.5" />}
              >
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="e.g. James Carter"
                  className={inputClass(!!errors.fullName)}
                />
              </Field>

              <Field
                label="Phone"
                required
                error={errors.phone}
                icon={<Phone className="w-3.5 h-3.5" />}
              >
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className={inputClass(!!errors.phone)}
                />
              </Field>

              <Field
                label="Email"
                required
                error={errors.email}
                icon={<Mail className="w-3.5 h-3.5" />}
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="name@email.com"
                  className={inputClass(!!errors.email)}
                />
              </Field>

              <Field
                label="Type of accident"
                required
                error={errors.accidentType}
                icon={<AlertTriangle className="w-3.5 h-3.5" />}
              >
                <select
                  value={form.accidentType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      accidentType: e.target.value as FlyerCategory | ''
                    }))
                  }
                  className={`${inputClass(!!errors.accidentType)} cursor-pointer`}
                >
                  <option value="" disabled>
                    Select accident type
                  </option>
                  {FLYER_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getFlyerCategoryLabel(c.id, language)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Notes"
                error={errors.notes}
                icon={<FileText className="w-3.5 h-3.5" />}
              >
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Case details, follow-up, language preference…"
                  className={`${inputClass(false)} resize-none`}
                />
              </Field>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingLeadId ? 'Update lead' : 'Save lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function inputClass(hasError: boolean) {
  return `w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-1 ${
    hasError
      ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100'
      : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
  }`;
}

function Field({
  label,
  required,
  error,
  icon,
  children
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
        <span className="text-slate-400">{icon}</span>
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

function LeadCard({
  lead,
  language,
  showOwner,
  canManage,
  onEdit,
  onDelete
}: {
  lead: Lead;
  language: 'en' | 'es';
  showOwner: boolean;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">{lead.fullName}</h3>
          <span className="inline-flex mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {getFlyerCategoryLabel(lead.accidentType, language)}
          </span>
        </div>
        {canManage &&
          (!confirm ? (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={onEdit}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center cursor-pointer"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirm(true)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
      </div>

      <div className="space-y-1.5 text-xs">
        <p className="flex items-center gap-2 text-slate-700">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold truncate">{lead.phone}</span>
        </p>
        <p className="flex items-center gap-2 text-slate-700">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold truncate">{lead.email}</span>
        </p>
        {lead.notes && (
          <p className="flex items-start gap-2 text-slate-600">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{lead.notes}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <span>
          {new Date(lead.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        {showOwner && <span className="font-semibold truncate">by {lead.createdByName}</span>}
      </div>
    </article>
  );
}
