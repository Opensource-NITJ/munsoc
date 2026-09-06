"use client";

import { useState, useEffect, useRef } from "react";
import { Reveal } from "@/components/motion";
import {
  Sparkles,
  Check,
  ChevronDown,
  Smartphone,
  Clock,
  Coffee,
  Laptop,
  Trophy,
  Coins,
  Lock,
  HelpCircle,
  Trash2,
  Calendar,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";

// CONFIGURATION: Payment URI
const UPI_ID = "manroopprsnl@oksbi";

// Categorized Portfolios for Youth Parliament (YPM)
export const GOVERNMENT_MEMBERS = [
  "Raghav Chadha (MP (Rajya Sabha))",
  "Narendra Modi (Prime Minister)",
  "Amit Shah (Minister of Home Affairs)",
  "Rajnath Singh (Minister of Defence)",
  "S. Jaishankar (Minister of External Affairs)",
  "Nirmala Sitharaman (Minister of Finance)",
  "J. P. Nadda (Minister of Health / Leader of the House (RS))",
  "Kiren Rijiju (Minister of Parliamentary Affairs)",
  "Nitin Gadkari (Minister of Road Transport & Highways)",
  "Shivraj Singh Chouhan (Minister of Agriculture)",
  "Manohar Lal Khattar (Minister of Power & Housing)",
  "Dharmendra Pradhan (Minister of Education)",
  "Piyush Goyal (Minister of Commerce & Industry)",
  "Ashwini Vaishnaw (Minister of Railways, I&B, and IT)",
  "Jyotiraditya Scindia (Minister of Communications)",
  "Bhupender Yadav (Minister of Environment & Forests)",
  "Kinjarapu Ram Mohan Naidu (Minister of Civil Aviation)",
  "Lallan Singh (Minister of Panchayati Raj)",
  "Chirag Paswan (Minister of Food Processing Industries)",
  "H. D. Kumaraswamy (Minister of Heavy Industries)",
  "Jitan Ram Manjhi (Minister of MSME)",
  "Jayant Chaudhary (Minister of State (Skill Development))",
  "Tejasvi Surya (MP, Bangalore South)",
  "Anurag Thakur (MP, Hamirpur)",
  "Ravi Shankar Prasad (MP, Patna Sahib)",
  "Sambit Patra (MP, Puri)",
  "Sudhanshu Trivedi (MP (Rajya Sabha))",
  "Bansuri Swaraj (MP, New Delhi)",
  "Kangana Ranaut (MP, Mandi)",
  "Giriraj Singh (Minister of Textiles)",
];

export const OPPOSITION_MEMBERS = [
  "Rahul Gandhi (Leader of the Opposition (Lok Sabha))",
  "Mallikarjun Kharge (Leader of the Opposition (Rajya Sabha))",
  "Shashi Tharoor (MP, Thiruvananthapuram)",
  "Gaurav Gogoi (MP, Jorhat)",
  "K. C. Venugopal (MP, Alappuzha)",
  "Manish Tewari (MP, Chandigarh)",
  "Jairam Ramesh (MP (Rajya Sabha))",
  "Pramod Tiwari (MP (Rajya Sabha))",
  "Tariq Anwar (MP, Katihar)",
  "Akhilesh Yadav (MP, Kannauj)",
  "Dimple Yadav (MP, Mainpuri)",
  "Awadhesh Prasad (MP, Faizabad)",
  "Ram Gopal Yadav (MP (Rajya Sabha))",
  "Abhishek Banerjee (MP, Diamond Harbour)",
  "Mahua Moitra (MP, Krishnanagar)",
  "Derek O'Brien (MP (Rajya Sabha))",
  "Kalyan Banerjee (MP, Srerampur)",
  "Kanimozhi Karunanidhi (MP, Thoothukkudi)",
  "T. R. Baalu (MP, Sriperumbudur)",
  "A. Raja (MP, Nilgiris)",
  "Tiruchi Siva (MP (Rajya Sabha))",
  "Supriya Sule (MP, Baramati)",
  "Arvind Sawant (MP, South Mumbai)",
  "Sanjay Raut (MP (Rajya Sabha))",
  "Priyanka Chaturvedi (MP (Rajya Sabha))",
  "Misa Bharti (MP, Pataliputra)",
  "Manoj Kumar Jha (MP (Rajya Sabha))",
  "John Brittas (MP (Rajya Sabha))",
  "Amra Ram (MP, Sikar)",
  "Thol. Thirumavalavan (MP, Chidambaram)",
  "Sanjay Singh (MP (Rajya Sabha))",
  "Asaduddin Owaisi (MP, Hyderabad)",
  "Chandrashekhar Azad (MP, Nagina)",
  "Amritpal Singh (MP, Khadoor Sahib)",
];

export const memberList = [...GOVERNMENT_MEMBERS, ...OPPOSITION_MEMBERS];

// Custom Canvas-based Liquid QR Code Component matching reference design
interface MunsocQrCodeProps {
  value: string;
  size?: number;
}

export function MunsocQrCode({ value, size = 260 }: MunsocQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render in high DPI
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(2, 2);

    // Clear Canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Generate QR code data matrix using qrcode library
    const qr = QRCode.create(value, { errorCorrectionLevel: "H" });
    const { modules } = qr;
    const moduleCount = modules.size;
    const cellSize = size / moduleCount;

    // Check if cell is in a finder pattern corner (size: 7x7)
    const isFinderPattern = (r: number, c: number) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= moduleCount - 7) return true;
      if (r >= moduleCount - 7 && c < 7) return true;
      return false;
    };

    // Center cutout for the logo (size: 8x8)
    const centerStart = Math.floor(moduleCount / 2) - 4;
    const centerEnd = Math.floor(moduleCount / 2) + 4;
    const isCenterLogoArea = (r: number, c: number) => {
      return (
        r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd
      );
    };

    // Helper: Draw smooth rounded rectangle
    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fillColor: string,
    ) => {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    };

    // Draw Finder Patterns (Corners) with modern curved squircle design
    const drawFinderPattern = (row: number, col: number) => {
      const x = col * cellSize;
      const y = row * cellSize;
      const outerSize = 7 * cellSize;
      const cornerRadius = cellSize * 2.2;

      // Outer Box (Dark slate / black)
      drawRoundedRect(x, y, outerSize, outerSize, cornerRadius, "#0f172a");

      // White inner cutout
      const whitePadding = cellSize * 1.05;
      drawRoundedRect(
        x + whitePadding,
        y + whitePadding,
        outerSize - whitePadding * 2,
        outerSize - whitePadding * 2,
        cornerRadius * 0.75,
        "#ffffff",
      );

      // Inner Solid Pill / Dot (#38bdf8 sky blue brand tint)
      const dotPadding = cellSize * 2.05;
      drawRoundedRect(
        x + dotPadding,
        y + dotPadding,
        outerSize - dotPadding * 2,
        outerSize - dotPadding * 2,
        cornerRadius * 0.5,
        "#0284c7",
      );
    };

    // Render 3 corner finder patterns
    drawFinderPattern(0, 0);
    drawFinderPattern(0, moduleCount - 7);
    drawFinderPattern(moduleCount - 7, 0);

    // Render Data Cells (Liquid rounded pills with smooth connected shapes)
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (isFinderPattern(r, c) || isCenterLogoArea(r, c)) continue;

        if (modules.get(r, c)) {
          const x = c * cellSize;
          const y = r * cellSize;

          // Liquid connectivity check: are adjacent top/bottom/left/right neighbors filled?
          const top =
            r > 0 &&
            modules.get(r - 1, c) &&
            !isFinderPattern(r - 1, c) &&
            !isCenterLogoArea(r - 1, c);
          const bottom =
            r < moduleCount - 1 &&
            modules.get(r + 1, c) &&
            !isFinderPattern(r + 1, c) &&
            !isCenterLogoArea(r + 1, c);
          const left =
            c > 0 &&
            modules.get(r, c - 1) &&
            !isFinderPattern(r, c - 1) &&
            !isCenterLogoArea(r, c - 1);
          const right =
            c < moduleCount - 1 &&
            modules.get(r, c + 1) &&
            !isFinderPattern(r, c + 1) &&
            !isCenterLogoArea(r, c + 1);

          // Liquid border radius: round isolated edges, square connected edges
          const rSize = cellSize * 0.45;
          const rTL = !top && !left ? rSize : 0;
          const rTR = !top && !right ? rSize : 0;
          const rBL = !bottom && !left ? rSize : 0;
          const rBR = !bottom && !right ? rSize : 0;

          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.roundRect(x, y, cellSize + 0.3, cellSize + 0.3, [
            rTL,
            rTR,
            rBR,
            rBL,
          ]);
          ctx.fill();
        }
      }
    }

    // Render Center Logo Badge
    const logoX = centerStart * cellSize;
    const logoY = centerStart * cellSize;
    const logoW = (centerEnd - centerStart + 1) * cellSize;
    const logoH = (centerEnd - centerStart + 1) * cellSize;

    // Outer white shield for logo
    drawRoundedRect(
      logoX - cellSize * 0.3,
      logoY - cellSize * 0.3,
      logoW + cellSize * 0.6,
      logoH + cellSize * 0.6,
      cellSize * 1.5,
      "#ffffff",
    );

    // Inner dark container
    drawRoundedRect(logoX, logoY, logoW, logoH, cellSize * 1.2, "#090d16");

    // Border stroke on logo box
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoW, logoH, cellSize * 1.2);
    ctx.stroke();

    // Draw MUNSoC Brand Logo SVG
    const img = new window.Image();
    img.src = "/munsoc-white-blue.svg";
    img.onload = () => {
      const pad = cellSize * 0.7;
      ctx.drawImage(
        img,
        logoX + pad,
        logoY + pad,
        logoW - pad * 2,
        logoH - pad * 2,
      );
    };
  }, [value, size]);

  return (
    <div className="relative p-3 bg-white rounded-2xl shadow-xl shadow-black/40 inline-block border-2 border-white/20">
      <canvas ref={canvasRef} className="block rounded-lg" />
    </div>
  );
}

// Custom Searchable Dropdown for Categorized Portfolios (Government vs Opposition)
function CustomDropdown({
  value,
  onChange,
  placeholder,
  disabled,
  selectedOtherValues,
  allottedList,
  govCapped,
  oppCapped,
  govCount,
  oppCount,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  selectedOtherValues: string[];
  allottedList: string[];
  govCapped?: boolean;
  oppCapped?: boolean;
  govCount?: number;
  oppCount?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLower = search.toLowerCase().trim();

  // Helper to filter and sort members of a side
  const processSide = (members: string[], isSideCapped?: boolean) => {
    return members
      .filter((opt) => opt.toLowerCase().includes(searchLower))
      .sort((a, b) => {
        const aAllotted =
          (allottedList.includes(a) || isSideCapped) && a !== value;
        const bAllotted =
          (allottedList.includes(b) || isSideCapped) && b !== value;
        if (aAllotted && !bAllotted) return 1;
        if (!aAllotted && bAllotted) return -1;
        return 0;
      });
  };

  const filteredGov = processSide(GOVERNMENT_MEMBERS, govCapped);
  const filteredOpp = processSide(OPPOSITION_MEMBERS, oppCapped);
  const totalResults = filteredGov.length + filteredOpp.length;

  const isValueGov = GOVERNMENT_MEMBERS.includes(value);
  const isValueOpp = OPPOSITION_MEMBERS.includes(value);

  const renderOption = (opt: string, isSideCapped?: boolean) => {
    const isSelectedElsewhere = selectedOtherValues.includes(opt);
    const isAllotted = allottedList.includes(opt) || Boolean(isSideCapped);
    const isCurrent = value === opt;
    const isUnavailable = (isSelectedElsewhere || isAllotted) && !isCurrent;

    return (
      <li key={opt}>
        <button
          type="button"
          disabled={isUnavailable}
          onClick={() => {
            onChange(opt);
            setIsOpen(false);
            setSearch("");
          }}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
            isCurrent
              ? "bg-[#38bdf8]/15 text-[#38bdf8] font-semibold"
              : isUnavailable
                ? "text-white/25 cursor-not-allowed opacity-40"
                : "text-white/80 hover:bg-white/5 hover:text-white cursor-pointer"
          }`}
        >
          <span className="truncate pr-2">{opt}</span>
          {isCurrent ? (
            <Check size={14} className="shrink-0 text-[#38bdf8]" />
          ) : isAllotted || isSideCapped ? (
            <span className="text-[9px] uppercase tracking-wider text-red-400/90 font-heading font-semibold bg-red-500/10 border border-red-500/25 px-1.5 py-0.5 rounded shrink-0">
              Allotted
            </span>
          ) : isSelectedElsewhere ? (
            <span className="text-[9px] uppercase tracking-wider text-white/30 font-heading shrink-0">
              Selected
            </span>
          ) : null}
        </button>
      </li>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#121212] border ${
          isOpen ? "border-[#38bdf8]" : "border-white/10"
        } rounded-lg px-4 py-3 text-left text-sm flex items-center justify-between transition-colors duration-200 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-white/20"
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {value && isValueGov && (
            <span className="text-[9px] uppercase tracking-wider font-heading font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
              Govt
            </span>
          )}
          {value && isValueOpp && (
            <span className="text-[9px] uppercase tracking-wider font-heading font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              Opp
            </span>
          )}
          <span
            className={
              value ? "text-white font-medium truncate" : "text-white/40"
            }
          >
            {value || placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-white/40 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-2.5 border-b border-white/10 relative">
            <input
              type="text"
              autoFocus
              placeholder="Search MP name, ministry, or constituency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] transition-colors"
            />
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 space-y-3">
            {totalResults > 0 ? (
              <>
                {/* Government Section */}
                {filteredGov.length > 0 && (
                  <div>
                    <div className="sticky top-0 bg-[#1c1c1e]/95 backdrop-blur z-10 px-2.5 py-1.5 mb-1 flex items-center justify-between border-b border-blue-500/20 rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                        <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-blue-300">
                          Government Side ({GOVERNMENT_MEMBERS.length})
                        </span>
                      </div>
                      {govCapped ? (
                        <span className="text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          25/25 Allotted &bull; Capped
                        </span>
                      ) : (
                        <span className="text-blue-300/80 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                          {typeof govCount === "number"
                            ? `${govCount}/25 Allotted`
                            : "Available"}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {filteredGov.map((opt) => renderOption(opt, govCapped))}
                    </ul>
                  </div>
                )}

                {/* Opposition Section */}
                {filteredOpp.length > 0 && (
                  <div>
                    <div className="sticky top-0 bg-[#1c1c1e]/95 backdrop-blur z-10 px-2.5 py-1.5 mb-1 flex items-center justify-between border-b border-amber-500/20 rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-amber-300">
                          Opposition Side ({OPPOSITION_MEMBERS.length})
                        </span>
                      </div>
                      {oppCapped ? (
                        <span className="text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          25/25 Allotted &bull; Capped
                        </span>
                      ) : (
                        <span className="text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                          {typeof oppCount === "number"
                            ? `${oppCount}/25 Allotted`
                            : "Available"}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {filteredOpp.map((opt) => renderOption(opt, oppCapped))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-xs text-white/40">
                No matching portfolios found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function YpmClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    institute: "",
    pref1: "",
    pref2: "",
    pref3: "",
    experience: "",
    transactionId: "",
  });

  const [allottedPortfolios, setAllottedPortfolios] = useState<string[]>([]);
  const [govCount, setGovCount] = useState<number>(0);
  const [oppCount, setOppCount] = useState<number>(0);
  const [isGovCapped, setIsGovCapped] = useState<boolean>(false);
  const [isOppCapped, setIsOppCapped] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState<boolean>(true);
  const [isRateLimitedClient, setIsRateLimitedClient] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1 = QR Code, 2 = Enter Txn ID
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand MUN Experience textarea based on contents
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [formData.experience]);

  const handleScreenshotUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (!base64String) {
          showCustomAlert(
            "Upload Failed",
            "Could not read receipt image data.",
          );
          setUploadingImage(false);
          return;
        }

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: base64String }),
          });

          const data = await res.json();
          if (res.ok && data.success && data.refId) {
            setFormData((prev) => ({ ...prev, transactionId: data.refId }));
          } else {
            showCustomAlert(
              "Upload Failed",
              data.error || "Upload rejected by server.",
            );
          }
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          showCustomAlert(
            "Upload Error",
            "Network error while uploading payment receipt.",
          );
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      showCustomAlert("Upload Error", "Failed to process image file.");
      setUploadingImage(false);
    }
  };

  const [customDialog, setCustomDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
  });

  const showCustomAlert = (title: string, message: string) => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type: "alert",
    });
  };

  const showCustomConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm,
      onCancel,
    });
  };

  const refreshAllottedPortfolios = async () => {
    setIsLoadingPortfolios(true);
    try {
      const res = await fetch("/api/register");
      if (res.ok) {
        const data = await res.json();
        const rawList: string[] = Array.isArray(data.allottedPortfolios)
          ? data.allottedPortfolios
          : Array.isArray(data.allotted)
            ? data.allotted
            : [];

        const actualAllotted: string[] =
          Array.isArray(data.actualAllotted) && data.actualAllotted.length > 0
            ? data.actualAllotted
            : rawList;

        const countGov = actualAllotted.filter((p) =>
          GOVERNMENT_MEMBERS.some(
            (m) => m.trim().toLowerCase() === p.trim().toLowerCase(),
          ),
        ).length;

        const countOpp = actualAllotted.filter((p) =>
          OPPOSITION_MEMBERS.some(
            (m) => m.trim().toLowerCase() === p.trim().toLowerCase(),
          ),
        ).length;

        const govFilled =
          typeof data.govCount === "number" ? data.govCount : countGov;
        const oppFilled =
          typeof data.oppCount === "number" ? data.oppCount : countOpp;

        const govCapReached = Boolean(data.isGovCapped) || govFilled >= 25;
        const oppCapReached = Boolean(data.isOppCapped) || oppFilled >= 25;

        setGovCount(govFilled);
        setOppCount(oppFilled);
        setIsGovCapped(govCapReached);
        setIsOppCapped(oppCapReached);
        setIsClosed(Boolean(data.isClosed) || (govCapReached && oppCapReached));

        // When one side reaches 25, all MPs on that side get marked Allotted!
        const effectiveList = new Set<string>(rawList);
        if (govCapReached) {
          GOVERNMENT_MEMBERS.forEach((m) => effectiveList.add(m));
        }
        if (oppCapReached) {
          OPPOSITION_MEMBERS.forEach((m) => effectiveList.add(m));
        }

        setAllottedPortfolios(Array.from(effectiveList));

        if (data.rateLimited) {
          setIsRateLimitedClient(true);
        }
      }
    } catch (err) {
      console.error("Failed to refresh allotted portfolios:", err);
    } finally {
      setIsLoadingPortfolios(false);
    }
  };

  useEffect(() => {
    refreshAllottedPortfolios();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoadingPortfolios) {
      showCustomAlert(
        "Please Wait",
        "Live portfolio availability is still loading. Please wait a moment before proceeding.",
      );
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.whatsapp ||
      !formData.institute ||
      !formData.pref1 ||
      !formData.pref2 ||
      !formData.pref3 ||
      !formData.experience
    ) {
      showCustomAlert(
        "Incomplete Application",
        "Please fill in all personal details, all 3 portfolio preferences, and past MUN/Parliamentary experience before proceeding to payment.",
      );
      return;
    }

    const isGov = (p: string) =>
      GOVERNMENT_MEMBERS.some(
        (m) => m.trim().toLowerCase() === (p || "").trim().toLowerCase(),
      );
    const isOpp = (p: string) =>
      OPPOSITION_MEMBERS.some(
        (m) => m.trim().toLowerCase() === (p || "").trim().toLowerCase(),
      );

    if (
      (isGovCapped &&
        (isGov(formData.pref1) ||
          isGov(formData.pref2) ||
          isGov(formData.pref3))) ||
      (isOppCapped &&
        (isOpp(formData.pref1) ||
          isOpp(formData.pref2) ||
          isOpp(formData.pref3))) ||
      allottedPortfolios.includes(formData.pref1) ||
      allottedPortfolios.includes(formData.pref2) ||
      allottedPortfolios.includes(formData.pref3)
    ) {
      showCustomAlert(
        "Portfolio Unavailable",
        "One or more of your selected preferences has already been allotted or belongs to a side that has reached its 25-member capacity. Please select from available portfolios.",
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showCustomAlert(
        "Invalid Email Format",
        "Please enter a valid, reachable email address to receive conference communications.",
      );
      return;
    }

    setModalStep(1);
    setIsPaymentModalOpen(true);
  };

  const handleCancelPayment = () => {
    showCustomConfirm(
      "Cancel Payment?",
      "Warning: If you close this payment session, you will lose your progress and have to refill the form. Are you sure you want to go back?",
      () => {
        setIsPaymentModalOpen(false);
        setCustomDialog((prev) => ({ ...prev, isOpen: false }));
        setFormData({
          name: "",
          email: "",
          whatsapp: "",
          institute: "",
          pref1: "",
          pref2: "",
          pref3: "",
          experience: "",
          transactionId: "",
        });
        setIsPaymentVerified(false);
      },
    );
  };

  const executeSubmit = async (overrideTxnId?: string) => {
    const activeTxnId = overrideTxnId || formData.transactionId;
    if (!activeTxnId || !activeTxnId.trim()) {
      showCustomAlert(
        "Transaction ID Required",
        "Please enter your UPI Transaction ID or upload a receipt screenshot.",
      );
      return;
    }

    setSubmitting(true);
    setIsPaymentVerified(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          transactionId: activeTxnId,
          committee: "Youth Parliament (YPM)",
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setIsRateLimitedClient(true);
        setIsPaymentModalOpen(false);
        return;
      }

      if (res.ok && data.success) {
        setIsPaymentModalOpen(false);
        setSubmitted(true);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        showCustomAlert(
          "Submission Issue",
          data.error ||
            "Failed to submit application. Please check your connection or contact the secretariat.",
        );
      }
    } catch (err) {
      console.error(err);
      showCustomAlert(
        "Network Error",
        "Failed to submit application. Please verify your internet connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSubmit();
  };

  const sanitizedRemark = `YPM-${(formData.name || "Delegate").replace(/[^a-zA-Z0-9]/g, "").slice(0, 15)}`;
  const dynamicPaymentUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=Manroop&aid=uGICAgKCj2K7eIw&am=300&cu=INR&tn=${sanitizedRemark}`;

  const currentActiveStep = isPaymentVerified ? 3 : isPaymentModalOpen ? 2 : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Fullscreen Blur Loading Overlay during Submission */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="bg-[#1c1c1e] border border-[#38bdf8]/30 rounded-2xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl shadow-[#38bdf8]/10">
              <div className="w-12 h-12 border-4 border-[#38bdf8]/20 border-t-[#38bdf8] rounded-full animate-spin mb-4" />
              <h4 className="font-heading font-bold text-white text-sm tracking-widest uppercase">
                Submitting Application
              </h4>
              <p className="text-white/60 text-xs mt-2 leading-relaxed">
                Please wait a moment while we process your application and
                notify the Secretariat...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Committee Overview & Information Panel */}
      {!submitted && (
        <div className="mb-14">
          <Reveal className="bg-[#1c1c1e] border border-white/5 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div
              className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#38bdf8]/5 blur-[80px]"
              aria-hidden
            />

            <div className="relative z-10 flex flex-col gap-6">
              <div>
                <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-4 uppercase">
                  COMMITTEE OVERVIEW
                </div>
                <h3
                  className="font-poster text-white text-3xl sm:text-4xl mb-4 tracking-wide leading-[0.95]"
                  style={{ letterSpacing: "0.05em" }}
                >
                  YOUTH PARLIAMENT (YPM)
                </h3>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-heading font-semibold tracking-wider text-[#38bdf8] mt-2 bg-[#38bdf8]/10 px-3 py-1.5 rounded border border-[#38bdf8]/20">
                    <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-ping" />
                    AGENDA: Discussions on comprehensive reforms to the Indian
                    examination system.
                  </div>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    This conference agenda focuses on modernizing India's
                    educational ecosystem. It aims to foster constructive
                    dialogue on shifting from rote learning to competency-based
                    evaluation.
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Key areas include integrating advanced technology for secure
                    and transparent logistics, and institutionalizing continuous
                    assessment to reduce student stress. The discussion
                    emphasizes around growth, institutional resilience, and
                    modernization.
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    Ultimately, the goal is to build a resilient, world-class
                    assessment infrastructure through bipartisan cooperation.
                  </p>
                </div>
              </div>

              {/* Event Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                {/* Date */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0 text-[#38bdf8]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block font-heading tracking-wider uppercase">
                      Event Date
                    </span>
                    <span className="text-white text-sm font-semibold">
                      10 October 2026
                    </span>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0 text-[#38bdf8]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block font-heading tracking-wider uppercase">
                      Timings
                    </span>
                    <span className="text-white text-sm font-semibold">
                      9:00 AM - 5:00 PM
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                  <div className="w-10 h-10 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0 text-[#38bdf8]">
                    <Laptop size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block font-heading tracking-wider uppercase">
                      Mode &amp; Venue
                    </span>
                    <span className="text-white text-sm font-semibold">
                      Offline &bull; NIT Jalandhar
                    </span>
                  </div>
                </div>

                {/* Registration Fee */}
                <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                  <div className="w-10 h-10 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0 text-[#38bdf8]">
                    <Coins size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block font-heading tracking-wider uppercase">
                      Registration Fee
                    </span>
                    <span className="text-white text-sm font-semibold">
                      ₹300
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* Application Form & Pay Section */}
      <div id="apply-now" className="scroll-mt-24">
        {!submitted && (
          <Reveal className="text-center mb-8">
            <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-4 uppercase">
              REGISTRATION &amp; PAYMENT PORTAL
            </div>
            <h2
              className="font-poster text-white text-4xl tracking-wide uppercase leading-[0.95]"
              style={{ letterSpacing: "0.05em" }}
            >
              APPLY FOR YOUTH PARLIAMENT
            </h2>
          </Reveal>
        )}

        {/* Step Progress Tracker */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-[#1c1c1e] border border-white/5 rounded-2xl p-2 sm:p-2.5 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { step: 1, title: "Details", desc: "Delegate info" },
                { step: 2, title: "Payment", desc: "₹300 Fee" },
                { step: 3, title: "Submitted", desc: "Confirmation" },
              ].map((item) => {
                const isCompleted = submitted || currentActiveStep > item.step;
                const isActive = !submitted && currentActiveStep === item.step;

                return (
                  <div
                    key={item.step}
                    className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? "bg-[#38bdf8]/10 border border-[#38bdf8]/30 shadow-md shadow-[#38bdf8]/10"
                        : isCompleted
                          ? "bg-emerald-500/5 border border-emerald-500/20"
                          : "bg-[#121212]/50 border border-white/5 opacity-40"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-heading text-xs font-bold shrink-0 transition-colors ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : isActive
                            ? "bg-[#38bdf8] text-[#0a0a0a] shadow-md shadow-[#38bdf8]/25"
                            : "bg-white/5 text-white/40 border border-white/10"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        `0${item.step}`
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-xs sm:text-sm font-heading tracking-wide uppercase font-bold truncate block ${
                          isActive
                            ? "text-white"
                            : isCompleted
                              ? "text-emerald-300"
                              : "text-white/60"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] font-heading tracking-wider uppercase block truncate mt-0.5 ${
                          isActive
                            ? "text-[#38bdf8]"
                            : isCompleted
                              ? "text-emerald-400/80"
                              : "text-white/30"
                        }`}
                      >
                        {isCompleted
                          ? "Completed"
                          : isActive
                            ? "In Progress"
                            : item.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isRateLimitedClient ? (
            <motion.div
              key="rate-limited-lock"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl mx-auto bg-[#1c1c1e] border border-red-500/20 rounded-2xl p-8 text-center shadow-lg shadow-red-950/5 mt-6"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <Lock size={30} />
              </div>
              <h3 className="font-heading font-bold text-white text-xl mb-3 uppercase tracking-wide">
                Submission Limit Reached
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4">
                You have reached the submission rate limit. Please wait a while
                before trying again.
              </p>
            </motion.div>
          ) : submitted ? (
            <motion.div
              key="submitted-success"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl mx-auto bg-[#1c1c1e] border border-[#38bdf8]/30 rounded-2xl p-8 text-center shadow-lg shadow-[#38bdf8]/5"
            >
              <div className="w-16 h-16 bg-[#38bdf8]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#38bdf8]">
                <Sparkles size={32} />
              </div>
              <h3 className="font-heading font-bold text-white text-xl mb-3 uppercase tracking-wide">
                Application Submitted!
              </h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-6">
                Thank you,{" "}
                <span className="text-[#38bdf8] font-bold">
                  {formData.name}
                </span>
                . Your application for the{" "}
                <strong className="text-white font-semibold">
                  Youth Parliament (YPM)
                </strong>{" "}
                has been successfully received. Our secretariat team will verify
                your payment, review portfolio preferences, and send your
                confirmation email.
              </p>

              {/* Receipt / Registration Summary Card */}
              <div className="bg-[#121212] border border-white/10 rounded-xl p-5 text-left space-y-4">
                {/* Contact row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-heading tracking-wider text-white/40 block mb-0.5">
                      Email Address
                    </span>
                    <span className="text-white font-medium break-all">
                      {formData.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-heading tracking-wider text-white/40 block mb-0.5">
                      WhatsApp
                    </span>
                    <span className="text-white font-medium">
                      {formData.whatsapp}
                    </span>
                  </div>
                </div>

                {/* Portfolio preferences row */}
                <div>
                  <span className="text-[10px] uppercase font-heading tracking-wider text-white/40 block mb-2">
                    Submitted Preferences
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { rank: 1, val: formData.pref1 },
                      { rank: 2, val: formData.pref2 },
                      { rank: 3, val: formData.pref3 },
                    ].map((pref) => (
                      <div
                        key={pref.rank}
                        className="flex items-center gap-2.5 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs"
                      >
                        <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-heading bg-[#38bdf8]/15 text-[#38bdf8] shrink-0">
                          {pref.rank}
                        </span>
                        <span className="text-white/80 truncate font-medium">
                          {pref.val || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction reference */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="text-[10px] uppercase font-heading tracking-wider text-white/40">
                    Payment Reference
                  </span>
                  <span className="font-mono text-[11px] text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 px-2.5 py-1 rounded w-fit break-all">
                    {formData.transactionId}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href="https://chat.whatsapp.com/DntwTYWxgvaJIpjhpTQ577"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-xs tracking-widest px-6 py-3 rounded-lg hover:bg-[#7dd3fc] transition-all inline-block shadow-lg shadow-[#38bdf8]/20"
                >
                  JOIN MUNSOC WHATSAPP COMMUNITY
                </a>
              </div>
            </motion.div>
          ) : !isLoadingPortfolios &&
            (isClosed ||
              (isGovCapped && isOppCapped) ||
              (govCount >= 25 && oppCount >= 25) ||
              allottedPortfolios.length >= memberList.length) ? (
            <motion.div
              key="registrations-closed"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl mx-auto bg-[#1c1c1e] border border-[#38bdf8]/20 rounded-2xl p-8 text-center shadow-lg shadow-[#38bdf8]/5 mt-6"
            >
              <div className="w-16 h-16 bg-[#38bdf8]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#38bdf8]">
                <Lock size={30} />
              </div>
              <h3 className="font-heading font-bold text-white text-xl mb-3 uppercase tracking-wide">
                Registrations Closed
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Thank you for your interest! All delegate portfolios for the{" "}
                <span
                  className="font-poster"
                  style={{ letterSpacing: "0.05em" }}
                >
                  YOUTH PARLIAMENT (YPM)
                </span>{" "}
                have been allotted (both Government and Opposition sides have
                reached maximum capacity), and registrations are now officially
                closed.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto w-full"
            >
              {/* Form Fields */}
              <Reveal className="bg-[#1c1c1e] border border-white/5 rounded-2xl p-6 sm:p-8 w-full">
                <form
                  onSubmit={
                    isPaymentVerified ? handleSubmit : handleProceedToPayment
                  }
                  className="flex flex-col gap-6"
                >
                  {/* Personal details fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-heading font-semibold tracking-wider text-white/70 uppercase">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        disabled={isPaymentVerified}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-heading font-semibold tracking-wider text-white/70 uppercase">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        disabled={isPaymentVerified}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-heading font-semibold tracking-wider text-white/70 uppercase">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        required
                        disabled={isPaymentVerified}
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="98765 43210"
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-heading font-semibold tracking-wider text-white/70 uppercase">
                        College / Institution *
                      </label>
                      <input
                        type="text"
                        name="institute"
                        required
                        disabled={isPaymentVerified}
                        value={formData.institute}
                        onChange={handleChange}
                        placeholder="NIT Jalandhar"
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Portfolio Preferences */}
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-heading font-semibold tracking-wider text-white/80 uppercase">
                        Portfolio Preferences (Rank 1 to 3) *
                      </h4>
                    </div>

                    {/* Side Capacity Status Tracker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                      {/* Government side status */}
                      <div
                        className={`p-3 rounded-xl border transition-all ${
                          isGovCapped
                            ? "bg-red-500/10 border-red-500/30 text-red-300"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-heading font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                            <span className="font-heading font-bold text-xs uppercase tracking-wider text-white">
                              Government Side ({GOVERNMENT_MEMBERS.length})
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              isGovCapped
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {isGovCapped
                              ? "25/25 ALLOTTED (CAPPED)"
                              : `${govCount}/25 ALLOTTED`}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isGovCapped ? "bg-red-400" : "bg-[#38bdf8]"
                            }`}
                            style={{
                              width: `${Math.min(100, (govCount / 25) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] mt-1.5 text-white/50">
                          {isGovCapped
                            ? "25/25 Government seats allotted. All Government MPs marked Allotted."
                            : `${Math.max(0, 25 - govCount)} seat${25 - govCount === 1 ? "" : "s"} remaining.`}
                        </p>
                      </div>

                      {/* Opposition side status */}
                      <div
                        className={`p-3 rounded-xl border transition-all ${
                          isOppCapped
                            ? "bg-red-500/10 border-red-500/30 text-red-300"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-heading font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="font-heading font-bold text-xs uppercase tracking-wider text-white">
                              Opposition Side ({OPPOSITION_MEMBERS.length})
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              isOppCapped
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {isOppCapped
                              ? "25/25 ALLOTTED (CAPPED)"
                              : `${oppCount}/25 ALLOTTED`}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOppCapped ? "bg-red-400" : "bg-amber-400"
                            }`}
                            style={{
                              width: `${Math.min(100, (oppCount / 25) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] mt-1.5 text-white/50">
                          {isOppCapped
                            ? "25/25 Opposition seats allotted. All Opposition MPs marked Allotted."
                            : `${Math.max(0, 25 - oppCount)} seat${25 - oppCount === 1 ? "" : "s"} remaining.`}
                        </p>
                      </div>
                    </div>

                    {isLoadingPortfolios ? (
                      <div className="bg-[#121212] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-10 h-10 border-[3px] border-[#38bdf8]/20 border-t-[#38bdf8] rounded-full animate-spin" />
                        <div>
                          <h4 className="font-heading font-bold text-white text-sm tracking-widest uppercase">
                            Loading Portfolios
                          </h4>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <span className="text-[11px] text-white/40 block">
                            Preference 1
                          </span>
                          <CustomDropdown
                            disabled={isPaymentVerified}
                            value={formData.pref1}
                            onChange={(val) =>
                              handleDropdownChange("pref1", val)
                            }
                            placeholder="Select Portfolio 1"
                            selectedOtherValues={[
                              formData.pref2,
                              formData.pref3,
                            ]}
                            allottedList={allottedPortfolios}
                            govCapped={isGovCapped}
                            oppCapped={isOppCapped}
                            govCount={govCount}
                            oppCount={oppCount}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] text-white/40 block">
                            Preference 2
                          </span>
                          <CustomDropdown
                            disabled={isPaymentVerified}
                            value={formData.pref2}
                            onChange={(val) =>
                              handleDropdownChange("pref2", val)
                            }
                            placeholder="Select Portfolio 2"
                            selectedOtherValues={[
                              formData.pref1,
                              formData.pref3,
                            ]}
                            allottedList={allottedPortfolios}
                            govCapped={isGovCapped}
                            oppCapped={isOppCapped}
                            govCount={govCount}
                            oppCount={oppCount}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] text-white/40 block">
                            Preference 3
                          </span>
                          <CustomDropdown
                            disabled={isPaymentVerified}
                            value={formData.pref3}
                            onChange={(val) =>
                              handleDropdownChange("pref3", val)
                            }
                            placeholder="Select Portfolio 3"
                            selectedOtherValues={[
                              formData.pref1,
                              formData.pref2,
                            ]}
                            allottedList={allottedPortfolios}
                            govCapped={isGovCapped}
                            oppCapped={isOppCapped}
                            govCount={govCount}
                            oppCount={oppCount}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Past MUN Experience */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <label className="text-xs font-heading font-semibold tracking-wider text-white/70 uppercase">
                      Past MUN / Parliamentary Experience *
                    </label>
                    <textarea
                      ref={textareaRef}
                      name="experience"
                      required
                      disabled={isPaymentVerified}
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="List previous conferences, committees, awards, or mention if this is your first conference..."
                      className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] transition-colors resize-none disabled:opacity-50"
                      rows={4}
                    />
                  </div>

                  {/* Payment Verification / Status Section */}
                  <div className="pt-4 border-t border-white/5">
                    {!isPaymentVerified ? (
                      <div className="bg-[#121212] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wide">
                              Registration Fee: ₹300
                            </h4>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full sm:w-auto bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-xs tracking-widest px-6 py-3 rounded-lg hover:bg-[#7dd3fc] transition-all shadow-md shadow-[#38bdf8]/10 cursor-pointer"
                        >
                          PROCEED TO PAY &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#0f241a] border border-emerald-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Check size={18} strokeWidth={3} />
                          </div>
                          <div>
                            <h4 className="font-heading font-semibold text-emerald-400 text-sm uppercase tracking-wide">
                              Payment Confirmed &bull; ₹300
                            </h4>
                            <p className="text-white/60 text-xs font-mono">
                              Txn / Ref ID: {formData.transactionId}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleCancelPayment}
                            className="text-white/40 hover:text-red-400 text-xs font-heading font-medium tracking-wider px-3 py-2 transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] font-heading font-bold text-xs tracking-widest px-6 py-3 rounded-lg transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                          >
                            {submitting
                              ? "SUBMITTING..."
                              : "CONFIRM & SUBMIT APPLICATION"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </Reveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#1c1c1e] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="bg-[#38bdf8]/15 text-[#38bdf8] text-[9px] font-heading font-bold tracking-widest px-2.5 py-0.5 rounded border border-[#38bdf8]/30 uppercase">
                    STEP {modalStep} OF 2
                  </span>
                  <h3 className="font-heading font-semibold text-white text-sm tracking-wide uppercase">
                    {modalStep === 1 ? "Scan & Pay ₹300" : "Verify Transaction"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCancelPayment}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {modalStep === 1 ? (
                  <motion.div
                    key="step-qr"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col items-center text-center gap-4"
                  >
                    <p className="text-white/60 text-xs">
                      Scan using Google Pay, PhonePe, Paytm, or any UPI app to
                      pay ₹300.
                    </p>

                    {/* QR Code */}
                    <div className="py-2">
                      <MunsocQrCode value={dynamicPaymentUri} size={220} />
                    </div>

                    <div className="w-full bg-[#121212] border border-white/5 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex justify-between text-white/50">
                        <span>UPI ID:</span>
                        <span className="font-mono text-white select-all">
                          {UPI_ID}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/50">
                        <span>Amount:</span>
                        <span className="font-semibold text-[#38bdf8]">
                          ₹300.00
                        </span>
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-2 pt-2">
                      <a
                        href={dynamicPaymentUri}
                        className="w-full sm:hidden bg-white/10 hover:bg-white/15 text-white font-heading font-semibold text-xs tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Smartphone size={14} />
                        OPEN IN UPI APP
                      </a>

                      <button
                        type="button"
                        onClick={() => setModalStep(2)}
                        className="w-full bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-xs tracking-widest py-3 rounded-lg hover:bg-[#7dd3fc] transition-all shadow-md shadow-[#38bdf8]/10 cursor-pointer"
                      >
                        I HAVE PAID &bull; ENTER TRANSACTION ID &rarr;
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-txn"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col gap-4"
                  >
                    <p className="text-white/60 text-xs">
                      Enter the 12-digit UPI reference ID / UTR or upload the
                      payment receipt screenshot.
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-heading font-semibold tracking-wider text-white/70 uppercase">
                          UPI Reference ID / Transaction ID
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsHelpModalOpen(true)}
                          className="text-[#38bdf8] hover:text-[#7dd3fc] text-[10px] font-heading font-semibold tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <HelpCircle size={12} />
                          Where to find?
                        </button>
                      </div>
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            transactionId: e.target.value,
                          }))
                        }
                        placeholder="e.g. 421589123456"
                        disabled={formData.transactionId.startsWith(
                          "MUNSOC-REF-",
                        )}
                        className="w-full bg-[#121212] border border-[#38bdf8]/35 focus:border-[#38bdf8] rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all font-mono disabled:opacity-45 disabled:cursor-not-allowed"
                        required
                      />
                    </div>

                    {/* Backup Upload Section */}
                    <div className="pt-3.5 border-t border-white/5 mt-1.5">
                      <span className="text-[9px] font-heading font-bold text-white/40 uppercase tracking-widest block mb-2 leading-relaxed">
                        Still can't find it? Upload the screenshot instead:
                      </span>
                      <label
                        className={`w-full bg-[#121212] border border-dashed rounded-lg px-4 py-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                          uploadingImage
                            ? "opacity-50 cursor-not-allowed border-white/5"
                            : "border-white/10 hover:border-[#38bdf8]/40 hover:bg-[#38bdf8]/5"
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
                            <svg
                              className="animate-spin h-3.5 w-3.5 text-[#38bdf8]"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Uploading receipt...</span>
                          </div>
                        ) : formData.transactionId &&
                          formData.transactionId.startsWith("MUNSOC-REF-") ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1.5 text-[11px] text-[#38bdf8] font-bold uppercase tracking-wider font-heading">
                              <Check size={14} />
                              <span>Screenshot Loaded</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFormData((prev) => ({
                                  ...prev,
                                  transactionId: "",
                                }));
                              }}
                              className="text-white/40 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              title="Remove Screenshot"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center select-none">
                            <span className="text-[10px] text-white/40 block font-medium">
                              Click to select receipt image
                            </span>
                            <span className="text-[8px] text-white/20 font-mono mt-0.5 block">
                              JPG, PNG or WEBP
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className="flex-1 border border-white/10 hover:border-white/20 text-white/70 font-heading font-semibold text-xs tracking-wider py-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        disabled={!formData.transactionId.trim() || submitting}
                        onClick={async () => {
                          await executeSubmit();
                        }}
                        className="flex-[2] bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-xs tracking-widest py-2.5 rounded-lg hover:bg-[#7dd3fc] transition-all shadow-md shadow-[#38bdf8]/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {submitting
                          ? "SUBMITTING..."
                          : "CONFIRM & SUBMIT APPLICATION"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal showing Google Pay Receipt Example */}
      <AnimatePresence>
        {isHelpModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsHelpModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[101] flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl relative cursor-default"
            >
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer text-[10px] uppercase tracking-wider font-heading font-bold"
              >
                CLOSE
              </button>

              <h4 className="font-heading font-bold text-white text-xs tracking-wider uppercase mb-3 pr-10">
                UPI Reference Number
              </h4>
              <p className="text-white/50 text-[10px] leading-relaxed mb-4">
                Open your UPI payment transaction receipt. Find the 12-digit
                numeric reference ID labeled as{" "}
                <strong>UPI transaction ID</strong> or <strong>Ref No.</strong>{" "}
                as highlighted below:
              </p>

              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center max-h-[420px] overflow-y-auto">
                <img
                  src="/UPI-Reference-Number-Google-Pay.jpeg.webp"
                  alt="UPI Reference ID Example"
                  className="w-full h-auto object-contain rounded"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Dialog Popout (Alert/Confirm) */}
      <AnimatePresence>
        {customDialog.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (customDialog.type === "confirm" && customDialog.onCancel) {
                customDialog.onCancel();
              }
              setCustomDialog((prev) => ({ ...prev, isOpen: false }));
            }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c1c1e] border border-white/10 max-w-sm w-full rounded-xl p-6 flex flex-col items-center text-center shadow-xl cursor-default"
            >
              <h4 className="font-heading font-semibold text-white text-base tracking-wide uppercase mb-2">
                {customDialog.title}
              </h4>
              <p className="text-white/60 text-xs leading-relaxed mb-6">
                {customDialog.message}
              </p>

              <div className="w-full flex gap-3">
                {customDialog.type === "confirm" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (customDialog.onCancel) customDialog.onCancel();
                        setCustomDialog((prev) => ({ ...prev, isOpen: false }));
                      }}
                      className="flex-1 bg-transparent border border-white/10 hover:border-white/20 text-white/70 font-heading font-semibold text-xs tracking-wider py-2.5 rounded-md transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (customDialog.onConfirm) customDialog.onConfirm();
                        setCustomDialog((prev) => ({ ...prev, isOpen: false }));
                      }}
                      className="flex-1 bg-[#38bdf8] text-[#0a0a0a] font-heading font-semibold text-xs tracking-wider py-2.5 rounded-md hover:bg-[#7dd3fc] transition-all cursor-pointer"
                    >
                      Confirm
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCustomDialog((prev) => ({ ...prev, isOpen: false }))
                    }
                    className="w-full bg-[#38bdf8] text-[#0a0a0a] font-heading font-semibold text-xs tracking-wider py-2.5 rounded-md hover:bg-[#7dd3fc] transition-all cursor-pointer"
                  >
                    OK
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
