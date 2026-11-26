export type Language = 'en' | 'am';

export interface Translations {
  brandName: string;
  nav: {
    menu: string;
    rewards: string;
    play: string;
    lounge: string;
  };
  header: {
    cashierCounterTitle: string;
    switchLangAria: string;
  };
  menu: {
    heroTag: string;
    heroHeadline: string;
    allCategory: string;
    categories: {
      'Hot Drinks': string;
      'Cold Drinks': string;
      'Snacks & Bites': string;
    };
    houseFavorite: string;
    itemsCount: (count: number) => string;
    footerNote: string;
    splitBillAndPay: string;
    spinUnlockedShort: string;
    etbAwayFromSpin: (amount: number) => string;
    billTitle: string;
    billSubtitle: string;
    spinUnlockedBanner: string;
    spinProgressBanner: (amount: number) => string;
    openSpinNow: string;
    emptyBill: string;
    each: string;
    total: string;
    splitBetween: string;
    splitRange: string;
    fullBill: string;
    exactShare: (count: number) => string;
    payInfoTitle: string;
    payInfoSubtitle: string;
    copy: string;
    copied: string;
  };
  rewards: {
    title: string;
    subtitle: string;
    cardHeader: string;
    yourCard: string;
    namedCard: (name: string) => string;
    preview: string;
    freeDrinkReady: string;
    moreToGo: (count: number) => string;
    freeBadge: string;
    lockedNote: string;
    claimFreeDrinkBtn: string;
    scanPromptNote: string;
    claimedCount: (count: number) => string;
    scanStampQr: string;
    plusOneStamp: string;
    spinCardTitle: string;
    spinRuleSimple: string;
    spinUnlockedByBill: (total: number) => string;
    spinNeedMore: (remaining: number) => string;
    spinNowBtn: string;
    goToMenuBtn: string;
    noLoginNeeded: string;
    orders800Plus: string;
    prizes: {
      teaWater: string;
      teaWaterSub: string;
      bonusStamps: string;
      bonusStampsSub: string;
      pastry: string;
      pastrySub: string;
      macchiatoJuice: string;
      macchiatoJuiceSub: string;
    };
    switchNumber: (name: string) => string;
    freeDrinkTitle: string;
    freeDrinkSub: string;
    cashierTapClaim: string;
    saveStampsToCard: string;
  };
  play: {
    title: string;
    subtitle: string;
    sameTableTab: string;
    tableVsTableTab: string;
    step2Badge: string;
    tvtHeadline: string;
    tvtDescription: string;
    tvtHowTitle: string;
    tvtStep1: string;
    tvtStep2: string;
    tvtStep3: string;
    tvtTablesLabel: string;
    tvtBackBtn: string;
    games: {
      'reaction-duel': { title: string; subtitle: string; players: string };
      'tic-tac-toe': { title: string; subtitle: string; players: string };
      'connect-4': { title: string; subtitle: string; players: string };
      trivia: { title: string; subtitle: string; players: string };
      'bill-roulette': { title: string; subtitle: string; players: string };
    };
  };
  counter: {
    backToCafe: string;
    cashierCounter: string;
    stampLabel: string;
    scanForStampTitle: string;
    manualCodeLabel: string;
    autoRotates: string;
    helperNote: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    brandName: 'Buna Room',
    nav: {
      menu: 'Menu',
      rewards: 'Rewards',
      play: 'Play',
      lounge: 'Lounge',
    },
    header: {
      cashierCounterTitle: 'Cashier Counter Mode',
      switchLangAria: 'Switch language to Amharic',
    },
    menu: {
      heroTag: 'Addis Ababa · Flat ETB prices',
      heroHeadline: 'Freshly brewed buna, espresso & warm bites.',
      allCategory: 'All',
      categories: {
        'Hot Drinks': 'Hot Drinks',
        'Cold Drinks': 'Cold Drinks',
        'Snacks & Bites': 'Snacks & Bites',
      },
      houseFavorite: 'House favorite',
      itemsCount: (c) => `${c} items`,
      footerNote: 'All prices are final in ETB. No VAT or service charge added.',
      splitBillAndPay: 'Split Bill & Pay',
      spinUnlockedShort: '800+ ETB — Spin unlocked!',
      etbAwayFromSpin: (amt) => `${amt} ETB away from Spin to Win`,
      billTitle: 'Table Bill',
      billSubtitle: 'Flat ETB prices · No VAT or service charge',
      spinUnlockedBanner:
        '800+ ETB reached! You unlocked a spin to win.',
      spinProgressBanner: (amt) =>
        `Add ${amt} ETB more to unlock Spin to Win!`,
      openSpinNow: 'Spin to Win',
      emptyBill: 'Your bill is empty. Tap items on the menu to add them.',
      each: 'ETB each',
      total: 'Total',
      splitBetween: 'Split Between',
      splitRange: '1 to 10 people at your table',
      fullBill: 'Full bill amount',
      exactShare: (count) => `Exact share per person (÷ ${count})`,
      payInfoTitle: 'Pay Info',
      payInfoSubtitle: 'Transfer via CBE or Telebirr and show your SMS at the counter.',
      copy: 'Copy',
      copied: 'Copied!',
    },
    rewards: {
      title: 'Rewards',
      subtitle: 'Collect 7 drink stamps for 1 free cup, or spend 800+ ETB to spin & win.',
      cardHeader: 'Buna Room · Buy 7, Get 1 Free',
      yourCard: 'Your Stamp Card',
      namedCard: (name) => `${name}’s Stamp Card`,
      preview: 'Preview',
      freeDrinkReady: 'Free drink ready',
      moreToGo: (count) => `${count} more to go`,
      freeBadge: 'FREE',
      lockedNote:
        'No sign-up needed until your first stamp scan.',
      claimFreeDrinkBtn: 'Show Cashier — Claim Free Drink',
      scanPromptNote: 'Scan the cashier’s QR after every drink order.',
      claimedCount: (count) => `${count} claimed`,
      scanStampQr: 'Scan Stamp QR',
      plusOneStamp: '+1 Stamp',
      spinCardTitle: '800+ ETB Spin to Win',
      spinRuleSimple: 'Spend more than 800 ETB and win your prize by spinning.',
      spinUnlockedByBill: (total) =>
        `Unlocked! Your visit total is ${total} ETB — tap below to spin.`,
      spinNeedMore: (remaining) =>
        `Add ${remaining} ETB more on the Menu to unlock your spin.`,
      spinNowBtn: 'Spin to Win',
      goToMenuBtn: 'Add Items on Menu',
      noLoginNeeded: 'No login needed',
      orders800Plus: '800+ ETB Visit',
      prizes: {
        teaWater: 'Free Tea or Water',
        teaWaterSub: 'One complimentary spiced tea or bottled water',
        bonusStamps: '+2 Bonus Stamps',
        bonusStampsSub: 'Added to your loyalty punch card',
        pastry: 'Free Pastry',
        pastrySub: 'One fresh counter pastry on the house',
        macchiatoJuice: 'Free Macchiato or Juice',
        macchiatoJuiceSub: 'One complimentary macchiato or fresh juice',
      },
      switchNumber: (name) => `Not ${name}? Switch number`,
      freeDrinkTitle: '1 Free Drink',
      freeDrinkSub: 'Any regular buna, macchiato, tea, or iced coffee',
      cashierTapClaim: 'Cashier Tap to Claim',
      saveStampsToCard: 'Sign In to Save +2 Stamps',
    },
    play: {
      title: 'Play',
      subtitle: 'Pass-and-play games built for the table while your buna brews.',
      sameTableTab: 'Same Table (1 Phone)',
      tableVsTableTab: 'Table vs. Table',
      step2Badge: 'Step 2',
      tvtHeadline: 'Table vs. Table Challenges',
      tvtDescription:
        'Challenge another table across our 15-seat cafe from your own phones — no passing one phone between tables.',
      tvtHowTitle: 'How Table vs. Table will work',
      tvtStep1: '1. Select your table (Table 1–4) and pick an opponent table.',
      tvtStep2: '2. Agree on a Friendly Deal (e.g., losing table buys a round of buna).',
      tvtStep3: '3. Play synced live Trivia Duel or Reaction Race on separate phones.',
      tvtTablesLabel: '4 Cafe Tables · Coming in Step 2',
      tvtBackBtn: 'Play Same-Table Games Now',
      games: {
        'reaction-duel': {
          title: 'Reaction Duel',
          subtitle: 'Phone flat on table. Wait for the olive flash, tap fastest. Best of 3.',
          players: '2 Players · Simultaneous',
        },
        'tic-tac-toe': {
          title: 'Tic-Tac-Toe',
          subtitle: 'Classic 3×3 quick pass-and-play match between sips.',
          players: '2 Players · Pass & Play',
        },
        'connect-4': {
          title: 'Connect 4',
          subtitle: 'Drop tokens into the 7×6 board to line up four in a row.',
          players: '2 Players · Pass & Play',
        },
        trivia: {
          title: 'Pass-the-Phone Trivia',
          subtitle: '5 timed 10-second questions each. Privacy handoff, then compare scores.',
          players: '2 Players · 10s Timer',
        },
        'bill-roulette': {
          title: 'Bill Roulette',
          subtitle: 'Add 2–8 friends at the table and spin the wheel to decide who pays.',
          players: '2–8 Players · Spin',
        },
      },
    },
    counter: {
      backToCafe: 'Back to Cafe',
      cashierCounter: 'Cashier Counter',
      stampLabel: '1 Drink Loyalty Stamp',
      scanForStampTitle: 'Scan for Today’s Stamp',
      manualCodeLabel: 'Manual 6-character code',
      autoRotates: 'Auto-rotates every 60s',
      helperNote:
        'Show this rotating QR to the guest after they order a drink. Codes refresh every 60 seconds so screenshots expire.',
    },
  },
  am: {
    brandName: 'ቡና ሩም',
    nav: {
      menu: 'ሜኑ',
      rewards: 'ሽልማት',
      play: 'ጨዋታ',
      lounge: 'ላውንጅ',
    },
    header: {
      cashierCounterTitle: 'የካሸር መቆጣጠሪያ',
      switchLangAria: 'Switch language to English',
    },
    menu: {
      heroTag: 'አዲስ አበባ · ቀጥታ የብር ዋጋ',
      heroHeadline: 'ትኩስ ቡና፣ ማኪያቶ እና ጣፋጭ ቁርስ።',
      allCategory: 'ሁሉም',
      categories: {
        'Hot Drinks': 'ትኩስ መጠጦች',
        'Cold Drinks': 'ቀዝቃዛ መጠጦች',
        'Snacks & Bites': 'ምግብ እና ቁርስ',
      },
      houseFavorite: 'ተወዳጅ',
      itemsCount: (c) => `${c} ዓይነቶች`,
      footerNote: 'ሁሉም ዋጋዎች በብር ናቸው። ምንም ቫት ወይም የአገልግሎት ክፍያ የለውም።',
      splitBillAndPay: 'ሂሳብ ክፈል / አካፍል',
      spinUnlockedShort: '800+ ብር — እሽክርክሪት ተከፍቷል!',
      etbAwayFromSpin: (amt) => `እሽክርክሪት ለመክፈት ${amt} ብር ይቀራል`,
      billTitle: 'የጠረጴዛ ሂሳብ',
      billSubtitle: 'ቀጥታ የብር ዋጋ · ያለ ቫት እና ሰርቪስ ቻርጅ',
      spinUnlockedBanner:
        '800+ ብር ደርሷል! Spin to Win ተከፍቷል።',
      spinProgressBanner: (amt) =>
        `Spin to Win ለመክፈት ${amt} ብር ተጨማሪ ይጨምሩ!`,
      openSpinNow: 'Spin to Win ክፈት',
      emptyBill: 'ሂሳብዎ ባዶ ነው። ከሜኑው ላይ የሚፈልጉትን ይምረጡ።',
      each: 'ብር በአንዱ',
      total: 'ጠቅላላ ድምር',
      splitBetween: 'ለስንት ሰው ይከፈል?',
      splitRange: 'ከ 1 እስከ 10 ሰው በጠረጴዛዎ',
      fullBill: 'ሙሉ ሂሳብ',
      exactShare: (count) => `ለአንድ ሰው የሚደርሰው (÷ ${count})`,
      payInfoTitle: 'የክፍያ መረጃ',
      payInfoSubtitle: 'በንግድ ባንክ ወይም በቴሌብር ከፍለው SMS ለካሸሩ ያሳዩ።',
      copy: 'ቅዳ',
      copied: 'ተቀድቷል!',
    },
    rewards: {
      title: 'ሽልማት',
      subtitle: '7 የመጠጥ ማህተም ሰብስበው 1 ነፃ መጠጥ ያግኙ፣ ወይም 800+ ብር ሲያወጡ ያሽከርክሩ።',
      cardHeader: 'ቡና ሩም · 7 ይግዙ፣ 1 ነፃ ያግኙ',
      yourCard: 'የእርስዎ ማህተም ካርድ',
      namedCard: (name) => `የ${name} ማህተም ካርድ`,
      preview: 'ቅድመ እይታ',
      freeDrinkReady: 'ነፃ መጠጥ ዝግጁ ነው',
      moreToGo: (count) => `${count} ማህተም ይቀራል`,
      freeBadge: 'ነፃ',
      lockedNote:
        'ማህተም እስኪያስገቡ መመዝገብ አያስፈልግም።',
      claimFreeDrinkBtn: 'ለካሸር ያሳዩ — ነፃ መጠጥ ይውሰዱ',
      scanPromptNote: 'መጠጥ ባዘዙ ቁጥር የካሸሩን QR ስካን ያድርጉ።',
      claimedCount: (count) => `${count} ጊዜ ተወስዷል`,
      scanStampQr: 'የማህተም QR ስካን ያድርጉ',
      plusOneStamp: '+1 ማህተም',
      spinCardTitle: '800+ ብር Spin to Win',
      spinRuleSimple: 'ከ 800 ብር በላይ ይጠቀሙ፣ በማሽከርከር ሽልማትዎን ያሸንፉ።',
      spinUnlockedByBill: (total) =>
        `ተከፍቷል! ሂሳብዎ ${total} ብር ደርሷል — ለማሽከርከር ከታች ይጫኑ።`,
      spinNeedMore: (remaining) =>
        `እሽክርክሪቱን ለመክፈት ከሜኑው ${remaining} ብር ተጨማሪ ይምረጡ።`,
      spinNowBtn: 'አሽከርክር እና ተሸለም',
      goToMenuBtn: 'ወደ ሜኑ ሂድ',
      noLoginNeeded: 'መመዝገብ አያስፈልግም',
      orders800Plus: '800+ ብር ትዕዛዝ',
      prizes: {
        teaWater: 'ነፃ ሻይ ወይም ውሃ',
        teaWaterSub: 'አንድ ነፃ ቅመም ሻይ ወይም የታሸገ ውሃ',
        bonusStamps: '+2 ተጨማሪ ማህተም',
        bonusStampsSub: 'ወደ ማህተም ካርድዎ የሚጨመር',
        pastry: 'ነፃ ኬክ / ፔስትሪ',
        pastrySub: 'ከካውንተሩ አንድ ነፃ ፔስትሪ',
        macchiatoJuice: 'ነፃ ማኪያቶ ወይም ጁስ',
        macchiatoJuiceSub: 'አንድ ነፃ ማኪያቶ ወይም ትኩስ ጁስ',
      },
      switchNumber: (name) => `${name} አይደሉም? ቁጥር ይቀይሩ`,
      freeDrinkTitle: '1 ነፃ መጠጥ',
      freeDrinkSub: 'ማንኛውም መደበኛ ቡና፣ ማኪያቶ፣ ሻይ ወይም አይስድ ኮፊ',
      cashierTapClaim: 'ካሸሩ ተጭኖ ያረጋግጥ',
      saveStampsToCard: '+2 ማህተም ለማስቀመጥ ይግቡ',
    },
    play: {
      title: 'ጨዋታ',
      subtitle: 'ቡናዎ እስኪመጣ በጠረጴዛ ላይ የሚጫወቱ አዝናኝ ጨዋታዎች።',
      sameTableTab: 'አንድ ጠረጴዛ (1 ስልክ)',
      tableVsTableTab: 'ጠረጴዛ ከጠረጴዛ',
      step2Badge: 'ደረጃ 2',
      tvtHeadline: 'ጠረጴዛ ከጠረጴዛ ውድድር',
      tvtDescription:
        'ባለ 15 ወንበር ካፌያችን ውስጥ ያሉ ጠረጴዛዎች በየራሳቸው ስልክ ፊት ለፊት የሚወዳደሩበት — ስልክ ሳያቀባብሉ!',
      tvtHowTitle: 'እንዴት እንደሚሰራ',
      tvtStep1: '1. የራስዎን ጠረጴዛ (Table 1–4) ይምረጡ እና ሌላ ጠረጴዛ ይጋብዙ።',
      tvtStep2: '2. ስምምነት ይያዙ (ለምሳሌ የተሸነፈው ጠረጴዛ ዙር ቡና ይጋብዛል)።',
      tvtStep3: '3. በቀጥታ በተለያዩ ስልኮች Trivia ወይም Reaction Race ይጫወቱ።',
      tvtTablesLabel: '4 የካፌ ጠረጴዛዎች · በደረጃ 2 ይመጣል',
      tvtBackBtn: 'የአንድ ጠረጴዛ ጨዋታዎችን ይጫወቱ',
      games: {
        'reaction-duel': {
          title: 'Reaction Duel (የፍጥነት ጨዋታ)',
          subtitle: 'ስልኩን ጠረጴዛው ላይ ያድርጉ። አረንጓዴ ሲበራ ቀድሞ የነካ ያሸንፋል። ከ3 ውድድር።',
          players: '2 ተጫዋቾች · በአንድ ጊዜ',
        },
        'tic-tac-toe': {
          title: 'Tic-Tac-Toe (ኤክስ እና ኦ)',
          subtitle: 'የተለመደው 3×3 ፈጣን ጨዋታ በስልክ ቅብብሎሽ።',
          players: '2 ተጫዋቾች · በተራ',
        },
        'connect-4': {
          title: 'Connect 4 (አራት አገናኝ)',
          subtitle: 'በ 7×6 ሰሌዳ ላይ 4 ተመሳሳይ ቀለም በመስመር ያገናኙ።',
          players: '2 ተጫዋቾች · በተራ',
        },
        trivia: {
          title: 'Pass-the-Phone Trivia (ጥያቄና መልስ)',
          subtitle: 'እያንዳንዳችሁ 5 የ10-ሰከንድ ጥያቄዎችን መልሱ እና ውጤት አወዳድሩ።',
          players: '2 ተጫዋቾች · 10 ሰከንድ',
        },
        'bill-roulette': {
          title: 'Bill Roulette (ማን ይክፈል?)',
          subtitle: 'ከ 2–8 ጓደኞችን ያስገቡ እና ማን እንደሚከፍል በእሽክርክሪት ይለዩ።',
          players: '2–8 ተጫዋቾች · እሽክርክሪት',
        },
      },
    },
    counter: {
      backToCafe: 'ወደ ካፌው ተመለስ',
      cashierCounter: 'የካሸር መቆጣጠሪያ',
      stampLabel: '1 የመጠጥ ማህተም',
      scanForStampTitle: 'ለዛሬ ማህተም ስካን ያድርጉ',
      manualCodeLabel: 'ባለ 6-ፊደል ኮድ',
      autoRotates: 'በየ 60 ሰከንዱ ይቀየራል',
      helperNote:
        'ደንበኛው መጠጥ ካዘዘ በኋላ ይህንን QR ያሳዩ። ኮዱ በየ 60 ሰከንዱ ስለሚቀየር ስክሪንሾት አይሰራም።',
    },
  },
};
