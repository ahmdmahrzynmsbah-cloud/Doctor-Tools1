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
      className="bg-white text-[#1E293B] p-8 md:p-10 w-[800px] sm:w-[850px] max-w-none min-h-[1050px] shadow-lg border border-[#E2E8F0] print:border-none print:shadow-none print:w-full print:max-w-none print:min-h-0 relative select-none font-sans mx-auto shrink-0" 
      dir="rtl"
      style={{ fontFamily: '"Cairo", system-ui, sans-serif' }}
    >
      {/* Decorative Top Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-2 ${invoice.isQuote ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B]' : 'bg-gradient-to-r from-[#2180B2] to-[#2ECC71]'}`} />

      {/* Header Container */}
      <div className="flex flex-row justify-between items-stretch border-b border-[#E2E8F0] pb-8 mb-8 mt-4">
        {/* Company Profile (Right) */}
        <div className="flex items-center gap-5">
          {profile.logo ? (
            <div className="w-24 h-24 bg-white rounded-2xl border border-[#CBD5E1] p-2 flex items-center justify-center shadow-md relative overflow-hidden shrink-0">
              <img 
                src={profile.logo} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain rounded-xl"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-[#2180B2] to-[#1A6B94] rounded-2xl border border-[#CBD5E1] flex items-center justify-center font-bold text-lg text-white shadow-md shrink-0">
              {profile.name ? profile.name.slice(0, 2) : 'لوجو'}
            </div>
          )}
          <div className="flex flex-col justify-center text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">{profile.name || 'Doctor Tools'}</h1>
            {profile.address && (
              <p className="text-[#64748B] text-sm mt-1.5 flex items-center gap-1.5 justify-start">
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
        <div className="flex flex-col justify-between items-end border-r border-[#E2E8F0] pr-6 mr-2 text-left">
          <div className="text-left">
            <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 border ${invoice.isQuote ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]'}`}>
              {invoice.isQuote ? 'عرض سعر معتمد' : 'فاتورة مبيعات معتمدة'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">{invoice.isQuote ? 'عرض سعر رقم' : 'فاتورة رقم'}</h2>
            <p className="font-mono text-xl font-black text-[#2180B2] mt-1 tracking-wider" dir="ltr">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-left mt-2 text-[#475569]">
            <p className="text-sm font-semibold">التاريخ: <span className="font-bold text-[#1E293B] font-mono">{new Date(invoice.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 mb-8 grid grid-cols-3 gap-6 text-right">
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1">العميل الكريم</span>
          <p className="font-extrabold text-base sm:text-lg text-[#0F172A]">{invoice.isQuote && invoice.customCustomerName ? invoice.customCustomerName : (customer?.name || 'عميل نقدي/عرض سعر')}</p>
        </div>
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1">رقم الهاتف</span>
          <p className="font-mono font-bold text-sm sm:text-md text-[#334155]" dir="ltr">{invoice.isQuote && invoice.customCustomerName ? '—' : (customer?.phone || '—')}</p>
        </div>
        <div>
          <span className="text-[#94A3B8] text-xs font-bold block mb-1">كود العميل</span>
          <p className="font-mono font-bold text-sm sm:text-md text-[#334155]" dir="ltr">{invoice.isQuote && invoice.customCustomerName ? '—' : (customer?.serialNumber || '—')}</p>
        </div>
      </div>

      {/* Items Table Container */}
      <div className="rounded-2xl border border-[#E2E8F0] mb-8 overflow-hidden print:overflow-visible print:border-none">
        <table className="w-full text-right border-collapse">
          <thead className="print:table-header-group">
            <tr className="bg-[#0F172A] text-white print:bg-transparent print:text-black print:border-b-2 print:border-black">
              <th className="py-3.5 px-4 text-xs font-extrabold text-center w-12">م</th>
              <th className="py-3.5 px-4 text-sm font-extrabold">البيان / الصنف</th>
              <th className="py-3.5 px-4 text-xs font-extrabold text-center w-20">الكمية</th>
              <th className="py-3.5 px-4 text-xs font-extrabold text-center w-28">سعر الوحدة</th>
              <th className="py-3.5 px-4 text-xs font-extrabold text-left w-32">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] bg-white print:table-row-group">
            {invoice.items.slice(0).map((item, idx) => {
              const invItem = inventory.find(i => i.id === item.itemId);
              const lineTotal = item.quantity * item.price;
              return (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors duration-150 break-inside-avoid">
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#64748B] text-sm print:text-black">{idx + 1}</td>
                  <td className="py-3.5 px-4 align-top text-right">
                    <span className="font-bold text-[#0F172A] text-sm sm:text-base">
                      {formatMixedText(invItem?.name || 'صنف محذوف')}
                    </span>
                    {invItem?.code && (
                      <>
                        <br />
                        <span className="font-mono text-xs text-[#94A3B8] print:text-gray-700 mt-0.5 inline-block" dir="ltr">{invItem.code}</span>
                      </>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-extrabold text-[#334155] print:text-black">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#475569] print:text-black" dir="ltr">{item.price.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-left font-mono font-extrabold text-[#0F172A] text-sm sm:text-md print:text-black">
                    <div className="inline-flex items-center gap-1" dir="ltr">
                      <span>{lineTotal.toLocaleString()}</span>
                      <span dir="rtl">ج.م</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Signature Section */}
      <div className="grid grid-cols-2 gap-6 items-end mb-10 pt-4 break-inside-avoid">
        {/* Left: Notes / Remarks */}
        <div className="bg-[#FAFDFB] rounded-2xl border border-[#DEF7EC] p-5 text-right">
          <h4 className="text-sm font-bold text-[#03543F] mb-2 flex items-center gap-1.5">
            <span>🛡️</span> {invoice.isQuote ? 'ملاحظات عرض السعر' : 'ضمان وجودة متميزة'}
          </h4>
          <p className="text-xs text-[#046C4E] leading-relaxed">
            {invoice.isQuote ? 
              'الأسعار الموضحة أعلاه سارية لمدة 7 أيام من تاريخ إطلاق عرض السعر، وتعتبر الفاتورة نافذة فور الاعتماد والتوريد. نشكر ثقتكم الغالية بنا!' :
              'لا ترد أو تستبدل البضاعة المباعة إلا في حالة وجود عيب صناعة واضح، وذلك خلال 14 يوماً من تاريخ الفاتورة بشرط سلامة العبوة وإحضار الفاتورة الأصلية. نشكر ثقتكم الغالية بنا دائماً!'
            }
          </p>
        </div>

        {/* Right: Beautiful Bento-style Totals Summary */}
        <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 space-y-3 shadow-sm text-right">
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-[#475569] border-b border-[#E2E8F0] pb-2 text-sm font-semibold">
              <span>الإجمالي قبل الخصم:</span>
              <div className="font-mono text-md text-[#475569] inline-flex items-center gap-1" dir="ltr">
                <span>{subtotal.toLocaleString()}</span>
                <span dir="rtl">ج.م</span>
              </div>
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
              <div className="font-mono text-md inline-flex items-center gap-1" dir="ltr">
                <span>-{discountAmount.toLocaleString()}</span>
                <span dir="rtl">ج.م</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-[#1E293B] border-b border-[#E2E8F0] pb-2 text-sm font-bold">
            <span>{invoice.isQuote ? (discountAmount > 0 ? 'إجمالي عرض السعر بعد الخصم:' : 'إجمالي عرض السعر:') : (discountAmount > 0 ? 'الإجمالي النهائي بعد الخصم:' : 'إجمالي الفاتورة:')}</span>
            <div className="font-mono text-base sm:text-lg font-black text-[#1E293B] inline-flex items-center gap-1" dir="ltr">
              <span>{invoice.total.toLocaleString()}</span>
              <span dir="rtl">ج.م</span>
            </div>
          </div>
          {!invoice.isQuote && (
            <>
              <div className="flex justify-between items-center text-[#16A34A] border-b border-[#E2E8F0] pb-2 text-sm font-bold">
                <span>المبلغ المدفوع:</span>
                <div className="font-mono text-md inline-flex items-center gap-1" dir="ltr">
                  <span>{invoice.paid.toLocaleString()}</span>
                  <span dir="rtl">ج.م</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-black text-[#0F172A]">المبلغ المتبقي:</span>
                <div className={`font-mono text-lg font-black ${remaining > 0 ? 'text-[#DC2626]' : 'text-[#0D9488]'} inline-flex items-center gap-1`} dir="ltr">
                  <span>{remaining.toLocaleString()}</span>
                  <span dir="rtl">ج.م</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Disclaimer & Signatures */}
      <div className="mt-12 pt-6 border-t border-[#E2E8F0] break-inside-avoid">
        <div className="flex justify-between items-center text-sm">
          <div className="text-center w-36">
            <p className="text-[#94A3B8] text-xs font-bold mb-6">إمضاء العميل</p>
            <div className="border-b border-[#CBD5E1] w-full h-6" />
          </div>
          <div className="text-center">
            <p className="font-extrabold text-sm text-[#0F172A]">شكراً جزيلاً لتعاملكم معنا!</p>
            <p className="text-xs text-[#64748B] mt-1">{profile.name || 'Doctor Tools'} — إدارة المبيعات</p>
          </div>
          <div className="text-center w-36">
            <p className="text-[#94A3B8] text-xs font-bold mb-6">إمضاء الحسابات</p>
            <div className="border-b border-[#CBD5E1] w-full h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
