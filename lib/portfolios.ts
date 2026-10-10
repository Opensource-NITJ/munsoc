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
export const TOTAL_PORTFOLIOS = memberList.length;

// Side limits in the Youth Parliament House
export const GOV_CAPACITY = 22;
export const OPP_CAPACITY = 25;
export const TOTAL_SEATS = GOV_CAPACITY + OPP_CAPACITY; // 47 total delegate seats

export interface AllotmentApiResponse {
  success?: boolean;
  allotted?: string[];
  allottedPortfolios?: string[];
  actualAllotted?: string[];
  totalAllotted?: number;
  govCount?: number;
  oppCount?: number;
  isGovCapped?: boolean;
  isOppCapped?: boolean;
  isClosed?: boolean;
  closed?: boolean;
  portfolioLimit?: number;
}

/**
 * Calculates the total number of remaining seats based on committee side capacity limits.
 * Matches the live seat availability displayed on the registration page (/committees/ypm).
 */
export function getAvailablePortfoliosCount(data?: AllotmentApiResponse | null): number {
  if (!data) return TOTAL_SEATS;

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

  const govFilled = typeof data.govCount === "number" ? data.govCount : countGov;
  const oppFilled = typeof data.oppCount === "number" ? data.oppCount : countOpp;

  const govCapReached = Boolean(data.isGovCapped) || govFilled >= GOV_CAPACITY;
  const oppCapReached = Boolean(data.isOppCapped) || oppFilled >= OPP_CAPACITY;
  const isClosed = Boolean(data.isClosed || data.closed) || (govCapReached && oppCapReached);

  if (isClosed) return 0;

  const govRemaining = govCapReached ? 0 : Math.max(0, GOV_CAPACITY - govFilled);
  const oppRemaining = oppCapReached ? 0 : Math.max(0, OPP_CAPACITY - oppFilled);

  return govRemaining + oppRemaining;
}

export const getAvailableSeatsCount = getAvailablePortfoliosCount;
