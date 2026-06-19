import React, { useState, useEffect } from 'react';
import { Invoice, Customer, InventoryItem, BusinessProfile } from '@/src/context/AppDataContext';

type InvoicePrintProps = {
  invoice: Invoice;
  customer?: Customer;
  inventory: InventoryItem[];
  profile: BusinessProfile;
};

export default function InvoicePrint({ invoice, customer, inventory, profile }: InvoicePrintProps) {
  const remaining = invoice.total - invoice.paid;
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const discountAmount = Math.max(0, subtotal - invoice.total);

  const [logoUrl, setLogoUrl] = useState<string | null>(profile.logo);
  const [isTainted, setIsTainted] = useState(false);

  useEffect(() => {
    if (!profile.logo) {
      setLogoUrl(null);
      setIsTainted(false);
      return;
    }
    if (profile.logo.startsWith('data:')) {
      setLogoUrl(profile.logo);
      setIsTainted(false);
      return;
    }

    let active = true;
    setLogoUrl(profile.logo); // Fallback / immediate URL to display right away

    fetch(profile.logo, { mode: 'cors' })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then((blob) => {
        if (active) {
          const objectUrl = URL.createObjectURL(blob);
          setLogoUrl(objectUrl);
          setIsTainted(false);
        }
      })
      .catch(() => {
        if (active) {
          setIsTainted(true);
        }
      });

    return () => {
      active = false;
    };
  }, [profile.logo]);

  return (
    <div 
      className="bg-white text-[#1E293B] p-6 md:p-10 w-full max-w-[850px] min-h-[1100px] shadow-lg border border-[#E2E8F0] print:border-none print:shadow-none print:w-full print:min-h-0 relative select-none font-sans mx-auto" 
      dir="rtl"
      style={{ fontFamily: '"Cairo", system-ui, sans-serif' }}
    >
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2180B2] to-[#2ECC71]" />

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-stretch border-b border-[#E2E8F0] pb-8 mb-8 mt-4 gap-6 sm:gap-0">
        {/* Company Profile (Right) */}
        <div className="flex items-center gap-5">
          {profile.logo ? (
            <div className="w-24 h-24 bg-white rounded-2xl border border-[#CBD5E1] p-2 flex items-center justify-center shadow-md relative overflow-hidden">
              {isTainted && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-xl flex items-center justify-center font-bold text-lg text-[#64748B] shadow-inner font-sans">
                  {profile.name ? profile.name.slice(0, 2) : 'لوجو'}
                </div>
              )}
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="max-w-full max-h-full object-contain rounded-xl"
                  crossOrigin={logoUrl.startsWith('data:') ? undefined : "anonymous"}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-[#2180B2] to-[#1A6B94] rounded-2xl border border-[#CBD5E1] flex items-center justify-center font-bold text-lg text-white shadow-md">
              {profile.name ? profile.name.slice(0, 2) : 'لوجو'}
            </div>
          )}
          <div className="flex flex-col justify-center text-right">
            <h1 className="text-3xl font-black text-[#1E293B]">{profile.name || 'Doctor Tools'}</h1>
            {profile.address && (
              <p className="text-[#64748B] text-sm mt-2 flex items-center gap-1.5 justify-start">
                <span>📍</span> {profile.address}
              </p>
            )}
            {profile.phone && (
              <p className="text-[#64748B] text-sm mt-1 flex items-center gap-1.5 justify-start" dir="rtl">
                <span>📞</span> <span className="font-bold font-mono text-[#475569]" dir="ltr">{profile.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Invoice Title & Quick Specs (Left) */}
        <div className="flex flex-col justify-between items-start sm:items-end sm:border-r sm:border-[#E2E8F0] sm:pr-8 sm:mr-4 pl-2 text-right sm:text-left">
          <div className="text-right sm:text-left">
            <div className="inline-block bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold px-3 py-1 rounded-full mb-2 border border-[#DBEAFE]">
              فاتورة مبيعات معتمدة
            </div>
            <h2 className="text-3xl font-extrabold text-[#0F172A]">فاتورة رقم</h2>
            <p className="font-mono text-xl font-black text-[#2180B2] mt-1 tracking-wider" dir="ltr">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right sm:text-left mt-4 text-[#475569]">
            <p className="text-sm font-semibold">التاريخ: <span className="font-bold text-[#1E293B] font-mono">{new Date(invoice.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          </div>
        </div>
      </div>

      {/* Customer Info Card / Quick Specs */}
      <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 mb-8 grid grid-cols-3 gap-6">
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1">العميل الكريم</span>
          <p className="font-extrabold text-lg text-[#0F172A]">{customer?.name || 'عميل غير معروف'}</p>
        </div>
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1">رقم الهاتف</span>
          <p className="font-mono font-bold text-md text-[#334155]" dir="ltr">{customer?.phone || '—'}</p>
        </div>
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1">كود العميل</span>
          <p className="font-mono font-bold text-md text-[#334155]" dir="ltr">{customer?.serialNumber || '—'}</p>
        </div>
      </div>

      {/* Items Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] mb-8">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#0F172A] text-white">
              <th className="py-4 px-5 text-xs font-extrabold text-center w-16">م</th>
              <th className="py-4 px-5 text-sm font-extrabold">البيان / الصنف</th>
              <th className="py-4 px-5 text-xs font-extrabold text-center w-24">الكمية</th>
              <th className="py-4 px-5 text-xs font-extrabold text-center w-32">سعر الوحدة</th>
              <th className="py-4 px-5 text-xs font-extrabold text-left w-36">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] bg-white">
            {invoice.items.slice(0).map((item, idx) => {
              const invItem = inventory.find(i => i.id === item.itemId);
              const lineTotal = item.quantity * item.price;
              return (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors duration-150">
                  <td className="py-4 px-5 text-center font-mono font-bold text-[#64748B] text-sm">{idx + 1}</td>
                  <td className="py-4 px-5">
                    <p className="font-bold text-[#0F172A] text-md">{invItem?.name || 'صنف محذوف'}</p>
                    {invItem?.code && <span className="font-mono text-xs text-[#94A3B8] mt-0.5 block" dir="ltr">{invItem.code}</span>}
                  </td>
                  <td className="py-4 px-5 text-center font-mono font-extrabold text-[#334155]">{item.quantity}</td>
                  <td className="py-4 px-5 text-center font-mono font-bold text-[#475569]" dir="ltr">{item.price.toLocaleString()}</td>
                  <td className="py-4 px-5 text-left font-mono font-extrabold text-[#0F172A] text-md" dir="ltr">{lineTotal.toLocaleString()} ج.م</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Signature Section */}
      <div className="grid grid-cols-2 gap-8 items-end mb-10 pt-4">
        {/* Left: Notes / Remarks */}
        <div className="bg-[#FAFDFB] rounded-2xl border border-[#DEF7EC] p-5">
          <h4 className="text-sm font-bold text-[#03543F] mb-2 flex items-center gap-1.5">
            <span>🛡️</span> ضمان وجودة متميزة
          </h4>
          <p className="text-xs text-[#046C4E] leading-relaxed">
            لا ترد أو تستبدل البضاعة المباعة إلا في حالة وجود عيب صناعة واضح، وذلك خلال 14 يوماً من تاريخ الفاتورة بشرط سلامة العبوة وإحضار الفاتورة الأصلية. نشكر ثقتكم الغالية بنا دائماً!
          </p>
        </div>

        {/* Right: Beautiful Bento-style Totals Summary */}
        <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 space-y-4 shadow-sm">
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-[#475569] border-b border-[#E2E8F0] pb-2 text-sm font-semibold">
              <span>الإجمالي قبل الخصم:</span>
              <span className="font-mono text-md text-[#475569]" dir="ltr">
                {subtotal.toLocaleString()} ج.م
              </span>
            </div>
          )}
          
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-[#DC2626] border-b border-[#E2E8F0] pb-2 text-sm font-bold bg-[#FEF2F2] px-3 py-1.5 rounded-lg border border-[#FECACA]">
              <span className="flex items-center gap-1.5">
                <span>الخصم المطبق</span>
                {invoice.discountValue && invoice.discountType === 'percentage' ? (
                  <span className="text-xs bg-[#FECACA] text-[#B91C1C] px-1.5 py-0.5 rounded-md font-mono">({invoice.discountValue}%)</span>
                ) : invoice.discountValue && invoice.discountType === 'fixed' ? (
                  <span className="text-xs bg-[#FECACA] text-[#B91C1C] px-1.5 py-0.5 rounded-md font-sans">(مبلغ ثابت)</span>
                ) : ''}
                :
              </span>
              <span className="font-mono text-md" dir="ltr">
                -{discountAmount.toLocaleString()} ج.م
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-[#1E293B] border-b border-[#E2E8F0] pb-2 text-sm font-bold">
            <span>{discountAmount > 0 ? 'الإجمالي النهائي بعد الخصم:' : 'إجمالي الفاتورة:'}</span>
            <span className="font-mono text-md font-black text-[#1E293B]" dir="ltr">{invoice.total.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between items-center text-[#16A34A] border-b border-[#E2E8F0] pb-2 text-sm font-bold">
            <span>المبلغ المدفوع:</span>
            <span className="font-mono text-md" dir="ltr">{invoice.paid.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-md font-black text-[#0F172A]">المبلغ المتبقي:</span>
            <span className={`font-mono text-xl font-black ${remaining > 0 ? 'text-[#DC2626]' : 'text-[#0D9488]'}`} dir="ltr">
              {remaining.toLocaleString()} ج.م
            </span>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer & Signatures */}
      <div className="mt-16 pt-8 border-t border-[#E2E8F0]">
        <div className="flex justify-between items-center text-sm">
          <div className="text-center w-40">
            <p className="text-[#94A3B8] text-xs font-bold mb-8">إمضاء العميل</p>
            <div className="border-b border-[#CBD5E1] w-full h-8" />
          </div>
          <div className="text-center">
            <p className="font-extrabold text-sm text-[#0F172A]">شكراً جزيلاً لتعاملكم معنا!</p>
            <p className="text-xs text-[#64748B] mt-1.5">نظام إدارة الفواتير والعملاء المتكامل</p>
          </div>
          <div className="text-center w-40">
            <p className="text-[#94A3B8] text-xs font-bold mb-8">إمضاء الحسابات</p>
            <div className="border-b border-[#CBD5E1] w-full h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
