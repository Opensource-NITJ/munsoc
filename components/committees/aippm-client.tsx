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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";

// CONFIGURATION: Payment URI
const UPI_ID = "manroopprsnl@oksbi";

const memberList = [
  "Narendra Modi (Prime Minister)",
  "Amit Shah (Minister of Home Affairs)",
  "Rajnath Singh (Minister of Defence)",
  "S. Jaishankar (Minister of External Affairs)",
  "J. P. Nadda (Minister of Health / Leader of the House (RS))",
  "Kiren Rijiju (Minister of Parliamentary Affairs & Minority Affairs)",
  "Sarbananda Sonowal (Minister of Ports, Shipping and Waterways)",
  "Nitin Gadkari (Minister of Road Transport and Highways)",
  "Shivraj Singh Chouhan (Minister of Agriculture)",
  "Manohar Lal Khattar (Minister of Power)",
  "Dharmendra Pradhan (Minister of Education)",
  "Piyush Goyal (Minister of Commerce & Industry)",
  "Ashwini Vaishnaw (Minister of Railways, I&B, and Electronics & IT)",
  "Jyotiraditya Scindia (Minister of Communications)",
  "Bhupender Yadav (Minister of Environment, Forest and Climate Change)",
  "Kinjarapu Ram Mohan Naidu (Minister of Civil Aviation)",
  "Lallan Singh (Minister of Panchayati Raj)",
  "Chirag Paswan (Minister of Food Processing Industries)",
  "H. D. Kumaraswamy (Minister of Heavy Industries)",
  "Jitan Ram Manjhi (Minister of MSME)",
  "Jayant Chaudhary (Minister of State (Skill Development))",
  "Prataprao Jadhav (Minister of State (Ayush))",
  "Anupriya Patel (Minister of State (Health))",
  "Ramdas Athawale (Minister of State (Social Justice))",
  "Biplab Kumar Deb (MP, Tripura West)",
  "Pabitra Margherita (MP (Rajya Sabha), Assam)",
  "Kamakhya Prasad Tasa (MP, Kaziranga (Assam))",
  "Birendra Prasad Baishya (MP (Rajya Sabha), Assam)",
  "Tejasvi Surya (MP, Bangalore South)",
  "Anurag Thakur (MP, Hamirpur)",
  "Ravi Shankar Prasad (MP, Patna Sahib)",
  "Sambit Patra (MP, Puri)",
  "Sudhanshu Trivedi (MP (Rajya Sabha))",
  "Bansuri Swaraj (MP, New Delhi)",
  "Kangana Ranaut (MP, Mandi)",
  "Giriraj Singh (Minister of Textiles)",
  "Daggubati Purandeswari (MP, Rajahmundry)",
  "C. R. Patil (Minister of Jal Shakti)",
  "Gajendra Singh Shekhawat (Minister of Culture)",
  "G. Kishan Reddy (Minister of Coal and Mines)",
  "Rahul Gandhi (Leader of the Opposition (Lok Sabha))",
  "Mallikarjun Kharge (Leader of the Opposition (Rajya Sabha))",
  "Angomcha Bimol Akoijam (MP, Inner Manipur)",
  "Alfred Kanngam Arthur (MP, Outer Manipur)",
  "Gaurav Gogoi (MP, Jorhat)",
  "Rakibul Hussain (MP, Dhubri)",
  "Pradyut Bordoloi (MP, Nagaon)",
  "Saleng A. Sangma (MP, Tura (Meghalaya))",
  "K. C. Venugopal (MP, Alappuzha)",
  "Shashi Tharoor (MP, Thiruvananthapuram)",
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
  "Sushmita Dev (MP (Rajya Sabha))",
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
  "Sudama Prasad (MP, Arrah)",
  "Thol. Thirumavalavan (MP, Chidambaram)",
  "E. T. Mohammed Basheer (MP, Malappuram)",
  "Sanjay Singh (MP (Rajya Sabha))",
  "Raghav Chadha (MP (Rajya Sabha))",
  "Mahua Maji (MP (Rajya Sabha))",
  "Sonam Wangchuk (Activist (Climate, Regional Rights))",
  "Irom Sharmila (Activist (Human Rights, Anti-AFSPA))",
  "Binalakshmi Nepram (Activist (Peace, Women's Rights))",
  "Medha Patkar (Activist (Social Justice, Environment))",
  "Harsh Mander (Activist (Human Rights, Peace Building))",
  "Yogendra Yadav (Activist (Farmers & Democratic Rights))",
  "Amritpal Singh (Khadoor Sahib)",
];

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
    const isCenterLogo = (r: number, c: number) => {
      return (
        r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd
      );
    };

    const isFilled = (r: number, c: number) => {
      if (r < 0 || r >= moduleCount || c < 0 || c >= moduleCount) return false;
      if (isFinderPattern(r, c) || isCenterLogo(r, c)) return false;
      return modules.get(c, r) === 1;
    };

    const roundRectPath = (
      c2d: CanvasRenderingContext2D,
      rx: number,
      ry: number,
      rw: number,
      rh: number,
      rr: number,
    ) => {
      c2d.moveTo(rx + rr, ry);
      c2d.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
      c2d.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
      c2d.arcTo(rx, ry + rh, rx, ry, rr);
      c2d.arcTo(rx, ry, rx + rw, ry, rr);
      c2d.closePath();
    };

    // Draw Body dots: solid black for maximum scannability, but slightly rounded for modern appearance
    ctx.fillStyle = "#000000";

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (isFilled(r, c)) {
          const x = c * cellSize;
          const y = r * cellSize;

          // Draw individual slightly rounded squares for high readability and premium look
          ctx.beginPath();
          roundRectPath(
            ctx,
            x + 0.25,
            y + 0.25,
            cellSize - 0.5,
            cellSize - 0.5,
            cellSize * 0.2,
          );
          ctx.fill();
        }
      }
    }

    // Draw Standardized Finder Patterns (solid black, no gradient, highly scannable, beautifully rounded outer/inner borders)
    const drawFinderPattern = (px: number, py: number, sizePx: number) => {
      const fCellSize = sizePx / 7;

      // Outer 7x7 block (black)
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      roundRectPath(ctx, px, py, sizePx, sizePx, fCellSize * 1.8);
      ctx.fill();

      // Middle 5x5 block (white)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      roundRectPath(
        ctx,
        px + fCellSize,
        py + fCellSize,
        sizePx - fCellSize * 2,
        sizePx - fCellSize * 2,
        fCellSize * 0.9,
      );
      ctx.fill();

      // Inner 3x3 block (black)
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      roundRectPath(
        ctx,
        px + fCellSize * 2,
        py + fCellSize * 2,
        sizePx - fCellSize * 4,
        sizePx - fCellSize * 4,
        fCellSize * 0.5,
      );
      ctx.fill();
    };

    const finderSize = 7 * cellSize;
    drawFinderPattern(0, 0, finderSize);
    drawFinderPattern(size - finderSize, 0, finderSize);
    drawFinderPattern(0, size - finderSize, finderSize);

    // Draw Logo Cutout and Logo Image in Center
    const logoImg = new Image();
    logoImg.src = "/munsoc-black-blue.svg";
    logoImg.onload = () => {
      const logoSize = 8 * cellSize;
      const lx = (size - logoSize) / 2;
      const ly = (size - logoSize) / 2;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(lx - 2, ly - 2, logoSize + 4, logoSize + 4);
      ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
    };
  }, [value, size]);

  return (
    <div className="bg-white p-4 rounded-3xl border-4 border-[#38bdf8]/35 shadow-lg shadow-[#38bdf8]/10 select-none">
      <canvas ref={canvasRef} />
    </div>
  );
}

// Custom dropdown component styled to match munsoc theme
interface CustomDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  required?: boolean;
  disabledOptions?: string[];
  allottedOptions?: string[];
  disabled?: boolean;
}

function CustomDropdown({
  label,
  value,
  onChange,
  options,
  required,
  disabledOptions = [],
  allottedOptions = [],
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Clear query when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Sort: active/non-allotted options first, allotted options at the bottom.
  const processedOptions = [...options].sort((a, b) => {
    const aAllotted = allottedOptions.includes(a);
    const bAllotted = allottedOptions.includes(b);
    if (aAllotted && !bAllotted) return 1;
    if (!aAllotted && bAllotted) return -1;
    return 0;
  });

  const filteredOptions = processedOptions.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <label className="text-[10px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selector Box */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full bg-[#121212] border rounded-lg px-4 py-2.5 text-xs text-white transition-all flex justify-between items-center select-none ${
          disabled
            ? "opacity-35 cursor-not-allowed border-white/5 bg-[#121212]/50"
            : isOpen
              ? "border-[#38bdf8] shadow-sm shadow-[#38bdf8]/15 cursor-pointer"
              : "border-white/8 hover:border-white/20 cursor-pointer"
        }`}
      >
        <span
          className={
            disabled
              ? "text-white/25"
              : value
                ? "text-white font-medium"
                : "text-white/30"
          }
        >
          {disabled ? "Locked" : value || "Select Member"}
        </span>
        <ChevronDown
          size={14}
          className={`text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Options Dropdown */}
      {!disabled && isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-[#1c1c1e] border border-white/10 rounded-lg shadow-xl z-50 py-1 flex flex-col max-h-56">
          {/* Search Box */}
          <div className="p-2 border-b border-white/5">
            <input
              type="text"
              placeholder="Search portfolio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8] transition-all"
            />
          </div>

          <ul className="overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-white/10 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isExcluded = disabledOptions.includes(opt);
                const isAllotted = allottedOptions.includes(opt);
                const isDisabled = isExcluded || isAllotted;
                return (
                  <li
                    key={opt}
                    onClick={() => {
                      if (!isDisabled) {
                        onChange(opt);
                        setIsOpen(false);
                      }
                    }}
                    className={`px-4 py-2 text-xs transition-colors select-none ${
                      isDisabled
                        ? "text-white/20 cursor-not-allowed bg-black/10"
                        : "text-white/80 hover:bg-[#38bdf8]/10 hover:text-white cursor-pointer"
                    } ${value === opt ? "bg-[#38bdf8]/20 text-white font-semibold" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={isAllotted ? "line-through opacity-70" : ""}
                      >
                        {opt}{" "}
                        {isAllotted && (
                          <span className="text-[9px] text-red-500/80 font-normal normal-case not-italic ml-1">
                            (Allocated)
                          </span>
                        )}
                      </span>
                      {value === opt && (
                        <Check size={12} className="text-[#38bdf8]" />
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-3 text-[11px] text-white/30 text-center select-none">
                No portfolios match search
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AippmClient() {
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

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (!base64String) {
          showCustomAlert("Upload Failed", "Could not read receipt image data.");
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
            showCustomAlert("Upload Failed", data.error || "Failed to process receipt image. Please try entering Transaction ID manually.");
          }
        } catch (err) {
          console.error("Upload fetch error:", err);
          showCustomAlert("Upload Failed", "Network error. Please try manually entering Transaction ID.");
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File read error:", err);
      showCustomAlert("Upload Failed", "Failed to read local image file.");
      setUploadingImage(false);
    }
  };

  const refreshAllottedPortfolios = async () => {
    try {
      const res = await fetch("/api/register");
      const data = await res.json();
      if (data.success) {
        if (data.allotted) {
          setAllottedPortfolios(data.allotted);
        }
        if (data.rateLimited) {
          setIsRateLimitedClient(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch allotted portfolios:", err);
    }
  };

  // Fetch allotted/taken portfolios from the Google Sheets API route on mount
  useEffect(() => {
    refreshAllottedPortfolios();
  }, []);

  // Custom dialog popout state
  const [customDialog, setCustomDialog] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const showCustomAlert = (title: string, message: string) => {
    setCustomDialog({
      isOpen: true,
      type: "alert",
      title,
      message,
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
      type: "confirm",
      title,
      message,
      onConfirm,
      onCancel,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showCustomAlert(
        "Required Fields Missing",
        "Please enter your Name to proceed.",
      );
      return;
    }
    if (!formData.email.trim()) {
      showCustomAlert(
        "Required Fields Missing",
        "Please enter your Email to proceed.",
      );
      return;
    }
    if (!formData.email.includes("@")) {
      showCustomAlert(
        "Invalid Email Format",
        "Please enter a valid email address.",
      );
      return;
    }
    if (!formData.whatsapp.trim()) {
      showCustomAlert(
        "Required Fields Missing",
        "Please enter your WhatsApp Number to proceed.",
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
      },
    );
  };

  const handlePaidClick = () => {
    setModalStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.whatsapp ||
      !formData.pref1 ||
      !formData.pref2 ||
      !formData.pref3 ||
      !formData.transactionId
    ) {
      showCustomAlert(
        "Required Fields Missing",
        "Please fill in all required fields.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        showCustomAlert(
          "Submission Failed",
          data.error || "Something went wrong. Please try again.",
        );
      }
    } catch (err) {
      console.error(err);
      showCustomAlert(
        "Network Error",
        "Network error. Please check your internet connection.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const rawRemark = `${formData.name}${formData.email}`;
  const sanitizedRemark = rawRemark.replace(/[^a-zA-Z0-9]/g, "").slice(0, 50);
  const dynamicPaymentUri = `upi://pay?pa=manroopprsnl@oksbi&pn=Manroop&aid=uGICAgKCj2K7eIw&am=150&cu=INR&tn=${sanitizedRemark}`;

  const currentActiveStep = isPaymentVerified
    ? submitted
      ? 4
      : 3
    : isPaymentModalOpen
      ? 2
      : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <Reveal>
          <h2 className="font-display text-white text-2xl tracking-wider mb-4 uppercase">
            About the Committee
          </h2>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4 text-pretty">
            It has now been almost 4 years since Manipur has been burning
            because of the communal violence and it seems that it is not going
            to come to a halt anytime soon. Thousands of people have lost their
            lives in this violence, despite curfews, internet shutdowns and
            central forces deployment, the government still hasnt been able to
            put an end to this situation. Which is why this committee has been
            formed, join us as we deliberate on this important issue and work
            together to find out who is at fault and have a meaningful
            discussion on how to end this despair.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-display text-white text-2xl tracking-wider mb-4 uppercase">
            Agenda &amp; Logistics
          </h2>
          <div className="space-y-4">
            <div className="bg-[#1c1c1e] border border-[#38bdf8]/30 rounded-xl p-6 hover:border-[#38bdf8]/50 transition-all duration-300 shadow-md shadow-[#38bdf8]/2">
              <span className="text-[#38bdf8] text-[10px] font-heading tracking-widest font-bold block mb-1">
                AGENDA
              </span>
              <h3 className="text-white font-heading font-bold text-sm tracking-wide leading-relaxed">
                Addressing the ethnic violence and governance challenges in
                Manipur with special emphasis on Centre-State relations
              </h3>
            </div>

            {/* Logistics details list with rounded icon badges */}
            <div className="bg-[#1c1c1e] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
              {/* Committee Date */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0 text-[#38bdf8]">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block font-heading tracking-wider uppercase">
                    Committee Date &amp; Time
                  </span>
                  <span className="text-white text-sm font-semibold">
                    16 July 2026, 9:00 AM
                  </span>
                </div>
              </div>

              {/* Timings */}
              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <div className="w-10 h-10 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0 text-[#38bdf8]">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block font-heading tracking-wider uppercase">
                    Committee Timings
                  </span>
                  <span className="text-white text-sm font-semibold">
                    9:00 AM - 5:00 PM
                  </span>
                </div>
              </div>

              {/* Lunch Break */}
              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <div className="w-10 h-10 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0 text-[#38bdf8]">
                  <Coffee size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block font-heading tracking-wider uppercase">
                    Lunch Break
                  </span>
                  <span className="text-white text-sm font-semibold">
                    2:00 PM - 3:00 PM
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
                    Location
                  </span>
                  <span className="text-white text-sm font-semibold">
                    Online
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
                  <span className="text-white text-sm font-semibold">₹150</span>
                </div>
              </div>

              {/* Cash Prizes */}
              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <div className="w-10 h-10 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0 text-[#38bdf8]">
                  <Trophy size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block font-heading tracking-wider uppercase">
                    Prizes &amp; Awards
                  </span>
                  <span className="text-white text-sm font-semibold">
                    Winner: ₹1,000 | Runner-up: ₹500
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Application Form & Pay Section */}
      <div id="apply-now" className="scroll-mt-24">
        <Reveal className="text-center mb-12">
          <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-4">
            REGISTRATION FORM
          </div>
          <h2 className="font-display text-white text-3xl tracking-wide">
            APPLY FOR AIPPM
          </h2>
        </Reveal>

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
                Exceeded limit
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4">
                You've exceeded the limit. Please wait for a while.
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
                . Your application for AIPPM has been received. Our secretariat
                team will review your portfolio preferences and email you with
                confirmation details.
              </p>
              <div className="bg-[#0a0a0a]/50 p-4 rounded-xl text-left border border-white/5 text-xs text-white/60 font-mono space-y-1">
                <div>
                  <span className="text-white/40">Email:</span> {formData.email}
                </div>
                <div>
                  <span className="text-white/40">WhatsApp:</span>{" "}
                  {formData.whatsapp}
                </div>
                <div>
                  <span className="text-white/40">Pref 1:</span>{" "}
                  {formData.pref1}
                </div>
                <div>
                  <span className="text-white/40">Pref 2:</span>{" "}
                  {formData.pref2}
                </div>
                <div>
                  <span className="text-white/40">Pref 3:</span>{" "}
                  {formData.pref3}
                </div>
                <div>
                  <span className="text-white/40">Txn ID:</span>{" "}
                  {formData.transactionId}
                </div>
              </div>
            </motion.div>
          ) : allottedPortfolios.length >= memberList.length ? (
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
                Thank you for your interest! All delegate portfolios for the All India Political Parties Meet (AIPPM) have been allotted, and registrations are now officially closed.
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Name */}
                    <div>
                      <label className="text-[10px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block mb-1.5">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full bg-[#121212] border border-white/8 rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#38bdf8] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={isPaymentVerified}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[10px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="w-full bg-[#121212] border border-white/8 rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#38bdf8] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={isPaymentVerified}
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="text-[10px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block mb-1.5">
                        WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="Enter WhatsApp number"
                        className="w-full bg-[#121212] border border-white/8 rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#38bdf8] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={isPaymentVerified}
                      />
                    </div>
                  </div>

                  {/* Institute Name */}
                  <div>
                    <label className="text-[10px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block mb-1.5">
                      Institute Name (if any)
                    </label>
                    <input
                      type="text"
                      name="institute"
                      value={formData.institute}
                      onChange={handleInputChange}
                      placeholder="Enter school/university name"
                      className="w-full bg-[#121212] border border-white/8 rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#38bdf8] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isPaymentVerified}
                    />
                  </div>

                  {/* MUN Experience Input */}
                  <div>
                    <label className="text-[10px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block mb-1.5">
                      Any previous MUN experience? (if any)
                    </label>
                    <textarea
                      ref={textareaRef}
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="List your previous MUN participation, portfolios, or awards. Feel free to explain in detail..."
                      className="w-full bg-[#121212] border border-white/8 rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#38bdf8] transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                      disabled={isPaymentVerified}
                    />
                  </div>

                  {/* Payment Verification / Status Section */}
                  <div className="border-t border-white/5 pt-6 mt-2">
                    {!isPaymentVerified ? (
                      <div className="w-full">
                        <button
                          type="submit"
                          className="w-full bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-xs tracking-widest py-3.5 rounded-lg hover:bg-[#7dd3fc] transition-all duration-300 shadow-md shadow-[#38bdf8]/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transform"
                        >
                          PROCEED TO PAYMENT
                        </button>
                        <p className="text-[10px] text-white/40 text-center mt-2.5 leading-relaxed">
                          Portfolio preference selection will unlock
                          automatically after completing the UPI transaction.
                        </p>

                        {/* Simple Downward Arrow */}
                        <div className="flex justify-center mt-5 mb-2 text-white/20">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 13l-7 7-7-7m7 7V3"
                            />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full bg-[#121212] border border-[#38bdf8]/35 rounded-xl p-4 flex items-center justify-between shadow-md shadow-[#38bdf8]/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#38bdf8]/10 rounded-full flex items-center justify-center text-[#38bdf8]">
                            <Check size={16} />
                          </div>
                          <div>
                            <span className="text-[9px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block">
                              Payment Confirmed
                            </span>
                            <span className="text-white text-xs font-semibold">
                              Portfolio Preferences Unlocked
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-heading font-bold tracking-widest text-white/30 uppercase block">
                            Ref ID
                          </span>
                          <span className="text-[#38bdf8] font-mono text-[10px] font-semibold">
                            {formData.transactionId}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preference Selection Header & Note */}
                  <div className="border-t border-white/5 pt-6 mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h3 className="text-white font-heading font-bold text-sm uppercase tracking-wide">
                        Portfolio Preference Choices
                      </h3>
                    </div>

                    {/* Three Side-by-Side Member/Portfolio Preferences */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <CustomDropdown
                        label="1st Preference"
                        value={formData.pref1}
                        onChange={handleDropdownChange("pref1")}
                        options={memberList}
                        required
                        disabledOptions={[formData.pref2, formData.pref3]}
                        allottedOptions={allottedPortfolios}
                        disabled={!isPaymentVerified}
                      />

                      <CustomDropdown
                        label="2nd Preference"
                        value={formData.pref2}
                        onChange={handleDropdownChange("pref2")}
                        options={memberList}
                        required
                        disabledOptions={[formData.pref1, formData.pref3]}
                        allottedOptions={allottedPortfolios}
                        disabled={!isPaymentVerified}
                      />

                      <CustomDropdown
                        label="3rd Preference"
                        value={formData.pref3}
                        onChange={handleDropdownChange("pref3")}
                        options={memberList}
                        required
                        disabledOptions={[formData.pref1, formData.pref2]}
                        allottedOptions={allottedPortfolios}
                        disabled={!isPaymentVerified}
                      />
                    </div>
                  </div>

                  {/* Final Submit Button (visible only after verified) */}
                  {isPaymentVerified && (
                    <div className="w-full mt-4 border-t border-white/5 pt-6">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-xs tracking-widest py-3.5 rounded-lg hover:bg-[#7dd3fc] transition-all duration-300 shadow-md shadow-[#38bdf8]/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.01] active:scale-[0.99] transform flex items-center justify-center gap-1.5"
                      >
                        {submitting ? (
                          <>
                            <svg
                              className="animate-spin h-3.5 w-3.5 text-black"
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
                            <span>SUBMITTING...</span>
                          </>
                        ) : (
                          "SUBMIT APPLICATION"
                        )}
                      </button>
                    </div>
                  )}
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#1c1c1e] border border-[#38bdf8]/30 max-w-sm w-full rounded-2xl p-5 relative flex flex-col items-center shadow-2xl max-h-[95vh] overflow-y-auto scrollbar-none"
            >
              {/* Warning Header */}
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded-lg p-2.5 mb-4 text-left w-full space-y-0.5">
                <span className="font-bold block uppercase tracking-wider text-[9px]">
                  ⚠️ Warning
                </span>
                <p className="leading-relaxed text-white/70">
                  Do NOT close this payment window. If you close this page or
                  exit, you will lose your progress and have to refill the
                  registration form.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {modalStep === 1 ? (
                  <motion.div
                    key="modal-step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    <h3 className="font-heading font-bold text-white text-sm tracking-wide mb-2 uppercase">
                      Secure UPI Payment
                    </h3>

                    {/* Styled liquid QR code matching munsoc theme (compact 170px) */}
                    <MunsocQrCode value={dynamicPaymentUri} size={170} />

                    {/* Action Details */}
                    <div className="w-full border-t border-white/5 pt-3.5 mt-3.5 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[9px] font-heading font-bold tracking-widest text-white/40 uppercase">
                          Amount Due
                        </span>
                        <span className="text-[#38bdf8] font-heading font-extrabold text-sm tracking-wide">
                          INR 150.00
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block mb-1">
                          UPI Address
                        </span>
                        <span className="text-white font-mono text-[10px] font-semibold select-all block bg-[#121212] border border-white/5 rounded-lg py-1.5 px-2.5 tracking-wide text-center">
                          {UPI_ID}
                        </span>
                      </div>

                      <a
                        href={dynamicPaymentUri}
                        className="w-full mt-1 bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-[11px] tracking-widest py-2.5 rounded-lg hover:bg-[#7dd3fc] transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-[#38bdf8]/10"
                      >
                        <Smartphone size={12} />
                        OPEN IN UPI APP
                      </a>

                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <button
                          type="button"
                          onClick={handleCancelPayment}
                          className="bg-transparent border border-white/10 hover:border-white/20 text-white/60 font-heading font-bold text-[11px] tracking-widest py-2.5 rounded-lg transition-all cursor-pointer"
                        >
                          CANCEL
                        </button>
                        <button
                          type="button"
                          onClick={handlePaidClick}
                          className="bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-[11px] tracking-widest py-2.5 rounded-lg hover:bg-[#7dd3fc] transition-all shadow-md shadow-[#38bdf8]/10 cursor-pointer"
                        >
                          PAID?
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="modal-step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center w-full"
                  >
                    <h3 className="font-heading font-bold text-white text-sm tracking-wide mb-1.5 uppercase text-center">
                      Payment Verification
                    </h3>
                    <p className="text-white/50 text-[10px] text-center mb-4 max-w-xs leading-relaxed">
                      Enter the Transaction ID / Ref Number below to verify your
                      UPI payment and unlock portfolio selection.
                    </p>

                    <div className="w-full space-y-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[9px] font-heading font-bold tracking-widest text-[#38bdf8] uppercase block">
                            Transaction ID / Ref No. <span className="text-red-500">*</span> <span className="text-[7px] border border-[#38bdf8] text-[#38bdf8] font-bold px-1.5 py-0.5 rounded ml-1.5 tracking-normal normal-case font-heading">Recommended</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsHelpModalOpen(true)}
                            className="text-[9px] text-[#38bdf8]/75 hover:text-[#38bdf8] transition-colors flex items-center gap-1 cursor-pointer font-bold tracking-wider uppercase font-heading"
                          >
                            <HelpCircle size={10} />
                            <span>Where is this?</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          name="transactionId"
                          value={formData.transactionId}
                          onChange={handleInputChange}
                          placeholder="e.g. 401234567890"
                          disabled={formData.transactionId.startsWith("MUNSOC-REF-")}
                          className="w-full bg-[#121212] border border-[#38bdf8]/35 focus:border-[#38bdf8] rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all font-mono disabled:opacity-45 disabled:cursor-not-allowed"
                          required
                        />
                      </div>

                      {/* Backup Upload Section */}
                      <div className="pt-3.5 border-t border-white/5 mt-1.5">
                        <span className="text-[9px] font-heading font-bold text-white/40 uppercase tracking-widest block mb-2 leading-relaxed">
                          Still can't find it? Upload the screenshot instead:
                        </span>
                        <label className={`w-full bg-[#121212] border border-dashed rounded-lg px-4 py-3 flex flex-col items-center justify-center cursor-pointer transition-all ${uploadingImage ? 'opacity-50 cursor-not-allowed border-white/5' : 'border-white/10 hover:border-[#38bdf8]/40 hover:bg-[#38bdf8]/5'}`}>
                          {uploadingImage ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
                              <svg className="animate-spin h-3.5 w-3.5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Uploading receipt...
                            </div>
                          ) : formData.transactionId && formData.transactionId.startsWith("MUNSOC-REF-") ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-1.5 text-[11px] text-[#38bdf8] font-bold uppercase tracking-wider font-heading">
                                <Check size={14} />
                                Screenshot Loaded
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setFormData((prev) => ({ ...prev, transactionId: "" }));
                                }}
                                className="text-white/40 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                title="Remove Screenshot"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center select-none">
                              <span className="text-[10px] text-white/40 block font-medium">Click to select receipt image</span>
                              <span className="text-[8px] text-white/20 font-mono mt-0.5 block">JPG, PNG or WEBP</span>
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

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setModalStep(1)}
                          className="bg-transparent border border-white/10 hover:border-white/20 text-white/60 font-heading font-bold text-[11px] tracking-widest py-2.5 rounded-lg transition-all cursor-pointer"
                        >
                          &larr; QR CODE
                        </button>
                        <button
                          type="button"
                          disabled={verifyingPayment}
                          onClick={async () => {
                            if (!formData.transactionId.trim()) {
                              showCustomAlert(
                                "Transaction ID Required",
                                "Please enter the payment Transaction ID or Reference Number from your receipt to proceed.",
                              );
                              return;
                            }
                            setVerifyingPayment(true);
                            try {
                              // Fetch fresh allocation status right before unlocking preferences
                              await refreshAllottedPortfolios();
                              setIsPaymentVerified(true);
                              setIsPaymentModalOpen(false);
                            } catch (err) {
                              console.error("Verification error:", err);
                            } finally {
                              setVerifyingPayment(false);
                            }
                          }}
                          className="bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-[11px] tracking-widest py-2.5 rounded-lg hover:bg-[#7dd3fc] transition-all shadow-md shadow-[#38bdf8]/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {verifyingPayment ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3 text-black"
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
                              <span>VERIFYING...</span>
                            </>
                          ) : (
                            "CONFIRM & UNLOCK"
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
              {/* Close button */}
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
                Open your UPI payment transaction receipt. Find the 12-digit numeric reference ID labeled as <strong>UPI transaction ID</strong> or <strong>Ref No.</strong> as highlighted below:
              </p>

              {/* Receipt Image */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center max-h-[420px] overflow-y-auto scrollbar-none">
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
    </div>
  );
}
