import React from 'react';
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

  const formatMixedText = (text: string) => {
    if (!text) return text;
    // Add a space between numbers and Arabic characters to prevent html2canvas overlapping bugs
    return text
      .replace(/(\d)([\u0600-\u06FF])/g, '$1 $2')
      .replace(/([\u0600-\u06FF])(\d)/g, '$1 $2');
  };

  return (
    <div 
      id="invoice-card"
      className="bg-white text-[#1E293B] p-8 md:p-10 w-[850px] max-w-none min-h-[1150px] shadow-lg border border-[#E2E8F0] print:border-none print:shadow-none print:w-full print:max-w-none print:min-h-0 relative select-none font-sans mx-auto shrink-0 flex flex-col justify-between" 
      dir="rtl"
      style={{ fontFamily: '"Cairo", system-ui, sans-serif', backgroundColor: '#ffffff', color: '#1E293B' }}
    >
      {/* Decorative Top Accent Bar */}
      <div 
        className={`w-full h-2 ${invoice.isQuote ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B]' : 'bg-gradient-to-r from-[#2180B2] to-[#2ECC71]'}`} 
        style={{ height: '8px', width: '100%', background: invoice.isQuote ? 'linear-gradient(to right, #D97706, #F59E0B)' : 'linear-gradient(to right, #2180B2, #2ECC71)' }}
      />

      {/* Header Container */}
      <div className="flex flex-row justify-between items-stretch border-b border-[#E2E8F0] pb-8 mb-8 mt-4" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '32px', marginBottom: '32px' }}>
        {/* Company Profile (Right) */}
        <div className="flex items-center gap-5">
          {profile.logo ? (
            <div className="w-24 h-24 bg-white rounded-2xl border border-[#CBD5E1] p-2 flex items-center justify-center shadow-md relative overflow-hidden shrink-0" style={{ backgroundColor: '#ffffff', borderColor: '#CBD5E1' }}>
              <img style={{ width: "80px", height: "80px", objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} width="80" height="80"  
                src={profile.logo} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain rounded-xl"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-[#2180B2] to-[#1A6B94] rounded-2xl border border-[#CBD5E1] flex items-center justify-center font-bold text-lg text-white shadow-md shrink-0" style={{ backgroundColor: '#2180B2', color: '#ffffff' }}>
              {profile.name ? profile.name.slice(0, 2) : 'لوجو'}
            </div>
          )}
          <div className="flex flex-col justify-center text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]" style={{ color: '#1E293B', fontSize: '28px', fontWeight: 900 }}>{profile.name || 'Doctor Tools'}</h1>
            {profile.address && (
              <p className="text-[#64748B] text-sm mt-1.5 flex items-center gap-1.5 justify-start" style={{ color: '#64748B' }}>
                <span>📍</span> {profile.address}
              </p>
            )}
            {profile.phone && (
              <p className="text-[#64748B] text-sm mt-1 flex items-center gap-1.5 justify-start" dir="rtl" style={{ color: '#64748B' }}>
                <span>📞</span> <span className="font-bold font-mono text-[#475569]" dir="ltr" style={{ color: '#475569' }}>{profile.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Invoice Title & Quick Specs (Left) */}
        <div className="flex flex-col justify-between items-end border-r border-[#E2E8F0] pr-6 mr-2 text-left" style={{ borderRight: '1px solid #E2E8F0', paddingRight: '24px' }}>
          <div className="text-left">
            <div 
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 border ${invoice.isQuote ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]'}`}
              style={{ backgroundColor: invoice.isQuote ? '#FFFBEB' : '#EFF6FF', color: invoice.isQuote ? '#D97706' : '#1D4ED8', borderColor: invoice.isQuote ? '#FDE68A' : '#DBEAFE' }}
            >
              {invoice.isQuote ? 'عرض سعر معتمد' : 'فاتورة مبيعات معتمدة'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]" style={{ color: '#0F172A', fontSize: '28px', fontWeight: 800 }}>{invoice.isQuote ? 'عرض سعر رقم' : 'فاتورة رقم'}</h2>
            <p className="font-mono text-xl font-black text-[#2180B2] mt-1 tracking-wider" dir="ltr" style={{ color: '#2180B2', fontSize: '20px', fontWeight: 900 }}>#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-left mt-2 text-[#475569]" style={{ color: '#475569' }}>
            <p className="text-sm font-semibold">التاريخ: <span className="font-bold text-[#1E293B] font-mono" style={{ color: '#1E293B' }}>{new Date(invoice.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 mb-8 grid grid-cols-3 gap-6 text-right" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1" style={{ color: '#94A3B8' }}>العميل الكريم</span>
          <p className="font-extrabold text-base sm:text-lg text-[#0F172A]" style={{ color: '#0F172A', fontWeight: 800 }}>{invoice.isQuote && invoice.customCustomerName ? invoice.customCustomerName : (customer?.name || 'عميل نقدي/عرض سعر')}</p>
        </div>
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1" style={{ color: '#94A3B8' }}>رقم الهاتف</span>
          <p className="font-mono font-bold text-sm sm:text-md text-[#334155]" dir="ltr" style={{ color: '#334155' }}>{invoice.isQuote && invoice.customCustomerName ? '—' : (customer?.phone || '—')}</p>
        </div>
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1" style={{ color: '#94A3B8' }}>كود العميل</span>
          <p className="font-mono font-bold text-sm sm:text-md text-[#334155]" dir="ltr" style={{ color: '#334155' }}>{invoice.isQuote && invoice.customCustomerName ? '—' : (customer?.serialNumber || '—')}</p>
        </div>
      </div>

      {/* Items Table Container */}
      <div className="rounded-2xl border border-[#E2E8F0] mb-8 overflow-hidden print:overflow-visible print:border-none" style={{ border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '32px' }}>
        <table className="w-full text-right border-collapse" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead className="print:table-header-group">
            <tr className="bg-[#0F172A] text-white print:bg-transparent print:text-black print:border-b-2 print:border-black" style={{ backgroundColor: '#0F172A', color: '#ffffff' }}>
              <th className="py-3.5 px-4 text-xs font-extrabold text-center w-12" style={{ backgroundColor: '#0F172A', color: '#ffffff', padding: '14px 16px' }}>م</th>
              <th className="py-3.5 px-4 text-sm font-extrabold" style={{ backgroundColor: '#0F172A', color: '#ffffff', padding: '14px 16px' }}>البيان / الصنف</th>
              <th className="py-3.5 px-4 text-xs font-extrabold text-center w-20" style={{ backgroundColor: '#0F172A', color: '#ffffff', padding: '14px 16px' }}>الكمية</th>
              <th className="py-3.5 px-4 text-xs font-extrabold text-center w-28" style={{ backgroundColor: '#0F172A', color: '#ffffff', padding: '14px 16px' }}>سعر الوحدة</th>
              <th className="py-3.5 px-4 text-xs font-extrabold text-left w-32" style={{ backgroundColor: '#0F172A', color: '#ffffff', padding: '14px 16px' }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] bg-white print:table-row-group" style={{ backgroundColor: '#ffffff' }}>
            {invoice.items.slice(0).map((item, idx) => {
              const invItem = inventory.find(i => i.id === item.itemId);
              const lineTotal = item.quantity * item.price;
              const rowBg = idx % 2 === 0 ? '#ffffff' : '#F8FAFC';
              return (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors duration-150 break-inside-avoid" style={{ backgroundColor: rowBg, borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#64748B] text-sm print:text-black" style={{ color: '#64748B', backgroundColor: rowBg, padding: '14px 16px' }}>{idx + 1}</td>
                  <td className="py-3.5 px-4 align-top text-right" style={{ backgroundColor: rowBg, padding: '14px 16px' }}>
                    <span className="font-bold text-[#0F172A] text-sm sm:text-base" style={{ color: '#0F172A', fontWeight: 700 }}>
                      {formatMixedText(invItem?.name || 'صنف محذوف')}
                    </span>
                    {invItem?.code && (
                      <>
                        <br />
                        <span className="font-mono text-xs text-[#94A3B8] print:text-gray-700 mt-0.5 inline-block" dir="ltr" style={{ color: '#94A3B8' }}>{invItem.code}</span>
                      </>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-extrabold text-[#334155] print:text-black" style={{ color: '#334155', backgroundColor: rowBg, padding: '14px 16px' }}>{item.quantity}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#475569] print:text-black" dir="ltr" style={{ color: '#475569', backgroundColor: rowBg, padding: '14px 16px' }}>{item.price.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-left font-mono font-extrabold text-[#0F172A] text-sm sm:text-md print:text-black" style={{ color: '#0F172A', backgroundColor: rowBg, padding: '14px 16px' }}>
                    <div className="inline-flex items-center gap-1" dir="ltr" style={{ color: '#0F172A' }}>
                      <span style={{ color: '#0F172A' }}>{lineTotal.toLocaleString()}</span>
                      <span dir="rtl" style={{ color: '#0F172A' }}>ج.م</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Signature Section */}
      <div className="grid grid-cols-2 gap-6 items-end mb-10 pt-4 break-inside-avoid" style={{ marginBottom: '40px' }}>
        {/* Left: Notes / Remarks */}
        <div className="bg-[#FAFDFB] rounded-2xl border border-[#DEF7EC] p-5 text-right" style={{ backgroundColor: '#FAFDFB', border: '1px solid #DEF7EC', borderRadius: '16px', padding: '20px' }}>
          <h4 className="text-sm font-bold text-[#03543F] mb-2 flex items-center gap-1.5" style={{ color: '#03543F' }}>
            <span>🛡️</span> {invoice.isQuote ? 'ملاحظات عرض السعر' : 'ضمان وجودة متميزة'}
          </h4>
          <p className="text-xs text-[#046C4E] leading-relaxed" style={{ color: '#046C4E', lineHeight: '1.6' }}>
            {invoice.isQuote ? 
              'الأسعار الموضحة أعلاه سارية لمدة 7 أيام من تاريخ إطلاق عرض السعر، وتعتبر الفاتورة نافذة فور الاعتماد والتوريد. نشكر ثقتكم الغالية بنا!' :
              'لا ترد أو تستبدل البضاعة المباعة إلا في حالة وجود عيب صناعة واضح، وذلك خلال 14 يوماً من تاريخ الفاتورة بشرط سلامة العبوة وإحضار الفاتورة الأصلية. نشكر ثقتكم الغالية بنا دائماً!'
            }
          </p>
        </div>

        {/* Right: Beautiful Bento-style Totals Summary */}
        <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 space-y-3 shadow-sm text-right" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-[#475569] border-b border-[#E2E8F0] pb-2 text-sm font-semibold" style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
              <span>الإجمالي قبل الخصم:</span>
              <div className="font-mono text-md text-[#475569] inline-flex items-center gap-1" dir="ltr" style={{ color: '#475569' }}>
                <span>{subtotal.toLocaleString()}</span>
                <span dir="rtl">ج.م</span>
              </div>
            </div>
          )}
          
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-[#DC2626] border-b border-[#E2E8F0] pb-2 text-sm font-bold bg-[#FEF2F2] px-3 py-1.5 rounded-lg border border-[#FECACA]" style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '6px 12px' }}>
              <span className="flex items-center gap-1.5">
                <span>الخصم المطبق</span>
                {invoice.discountValue && invoice.discountType === 'percentage' ? (
                  <span className="text-xs bg-[#FECACA] text-[#B91C1C] px-1.5 py-0.5 rounded-md font-mono" style={{ backgroundColor: '#FECACA', color: '#B91C1C' }}>({invoice.discountValue}%)</span>
                ) : invoice.discountValue && invoice.discountType === 'fixed' ? (
                  <span className="text-xs bg-[#FECACA] text-[#B91C1C] px-1.5 py-0.5 rounded-md font-sans" style={{ backgroundColor: '#FECACA', color: '#B91C1C' }}>(مبلغ ثابت)</span>
                ) : ''}
                :
              </span>
              <div className="font-mono text-md inline-flex items-center gap-1" dir="ltr" style={{ color: '#DC2626' }}>
                <span>-{discountAmount.toLocaleString()}</span>
                <span dir="rtl">ج.م</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-[#1E293B] border-b border-[#E2E8F0] pb-2 text-sm font-bold" style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
            <span>{invoice.isQuote ? (discountAmount > 0 ? 'إجمالي عرض السعر بعد الخصم:' : 'إجمالي عرض السعر:') : (discountAmount > 0 ? 'الإجمالي النهائي بعد الخصم:' : 'إجمالي الفاتورة:')}</span>
            <div className="font-mono text-base sm:text-lg font-black text-[#1E293B] inline-flex items-center gap-1" dir="ltr" style={{ color: '#1E293B', fontWeight: 900 }}>
              <span>{invoice.total.toLocaleString()}</span>
              <span dir="rtl">ج.م</span>
            </div>
          </div>
          {!invoice.isQuote && (
            <>
              <div className="flex justify-between items-center text-[#16A34A] border-b border-[#E2E8F0] pb-2 text-sm font-bold" style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                <span>المبلغ المدفوع:</span>
                <div className="font-mono text-md inline-flex items-center gap-1" dir="ltr" style={{ color: '#16A34A' }}>
                  <span>{invoice.paid.toLocaleString()}</span>
                  <span dir="rtl">ج.م</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-sm font-black text-[#0F172A]" style={{ color: '#0F172A', fontWeight: 900 }}>المبلغ المتبقي:</span>
                <div className={`font-mono text-lg font-black ${remaining > 0 ? 'text-[#DC2626]' : 'text-[#0D9488]'} inline-flex items-center gap-1`} dir="ltr" style={{ color: remaining > 0 ? '#DC2626' : '#0D9488', fontWeight: 900 }}>
                  <span>{remaining.toLocaleString()}</span>
                  <span dir="rtl">ج.م</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Disclaimer & Signatures */}
      <div className="mt-12 pt-6 border-t border-[#E2E8F0] break-inside-avoid" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px', marginTop: '48px' }}>
        <div className="flex justify-between items-center text-sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="text-center w-36">
            <p className="text-[#94A3B8] text-xs font-bold mb-6" style={{ color: '#94A3B8' }}>إمضاء العميل</p>
            <div className="border-b border-[#CBD5E1] w-full h-6" style={{ borderBottom: '1px solid #CBD5E1' }} />
          </div>
          <div className="text-center">
            <p className="font-extrabold text-sm text-[#0F172A]" style={{ color: '#0F172A', fontWeight: 800 }}>شكراً جزيلاً لتعاملكم معنا!</p>
            <p className="text-xs text-[#64748B] mt-1" style={{ color: '#64748B' }}>{profile.name || 'Doctor Tools'} — إدارة المبيعات</p>
          </div>
          <div className="text-center w-36">
            <p className="text-[#94A3B8] text-xs font-bold mb-6" style={{ color: '#94A3B8' }}>إمضاء الحسابات</p>
            <div className="border-b border-[#CBD5E1] w-full h-6" style={{ borderBottom: '1px solid #CBD5E1' }} />
          </div>
        </div>
      </div>

      {/* Developer Footer */}
      <div className="mt-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-center break-inside-avoid flex flex-col sm:flex-row justify-between items-center gap-2" style={{ marginTop: '32px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="text-xs font-bold text-[#64748B]" dir="ltr" style={{ color: '#64748B', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>ALL RIGHTS RESERVED © 2026</p>
        <p className="text-xs font-bold text-[#2180B2]" dir="ltr" style={{ color: '#2180B2', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>Developed by Fox Tech</p>
        <p className="text-xs font-bold text-[#64748B]" dir="ltr" style={{ color: '#64748B', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>📞 01034859313</p>
      </div>
    </div>
  );
}
