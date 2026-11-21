"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Send } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function ShareButtons({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const text = "Գայանեի անակնկալ ծննդյան հրավիրատոմսը 🌸";
  const enc = encodeURIComponent;
  const fbApp = process.env.NEXT_PUBLIC_FB_APP_ID;

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}`, icon: <MessageCircle size={18} /> },
    { label: "Telegram", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`, icon: <Send size={18} /> },
    {
      label: "Messenger",
      href: fbApp
        ? `https://www.facebook.com/dialog/send?app_id=${fbApp}&link=${enc(url)}&redirect_uri=${enc(url)}`
        : `fb-messenger://share/?link=${enc(url)}`,
      icon: <MessageCircle size={18} />,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    navigator.vibrate?.(15);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-wrap justify-center gap-2.5">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="btn-outline !px-4 !py-2.5 text-sm">
            {l.icon}
            {l.label}
          </a>
        ))}
        <button type="button" onClick={copy} className="btn-outline !px-4 !py-2.5 text-sm">
          {copied ? <Check size={18} /> : <Link2 size={18} />}
          {copied ? "Պատճենվեց" : "Copy Link"}
        </button>
      </div>
      <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-soft">
        <QRCodeSVG value={url} size={132} fgColor="#60452E" bgColor="#FFFFFF" level="M" />
      </div>
      <p className="text-xs text-brown/60">QR կոդ՝ հրավիրատոմսի հղումով</p>
    </div>
  );
}
