/*
 * GENERATED once by scripts/extract-page-copy.mjs, then maintained by hand.
 *
 * The shape of each page's copy, mirroring the Keystatic singletons in
 * keystatic.copy.ts. The content collection itself validates loosely, so this is
 * what keeps a component honest about the fields it reads.
 */

export interface ComFuncionaCopy {
    eyebrow: string;
    title: string;
    intro: string;
    stepsTitle: string;
    stepsIntro: string;
    steps: {
      icon: string;
      t: string;
      d: string;
    }[];
    whyTitle: string;
    why: {
      icon: string;
      t: string;
      d: string;
    }[];
    compareTitle: string;
    compareRows: {
      a: string;
      b: string;
      c: string;
    }[];
    compareHeads: string[];
    modelTitle: string;
    modelText: string;
    finalTitle: string;
    finalText: string;
  }

export interface ComparativaCopy {
    eyebrow: string;
    title: string;
    tableTitle: string;
    intro: string;
    unavailableTitle: string;
    unavailableText: string;
    honestTitle: string;
    honest: {
      t: string;
      d: string;
    }[];
    finalTitle: string;
    finalText: string;
  }

export interface ContacteCopy {
    topic: string;
    consent: string;
    consentNote: string;
    read: string;
  }

export interface ElSuperCopy {
    title: string;
    heading: string;
    intro: string;
    features: {
      icon: string;
      title: string;
      text: string;
    }[];
    shopTitle: string;
    shopText: string;
    hoursTitle: string;
    transit: string;
    directions: string;
    visit: string;
  }

export interface FesTeSociaCopy {
    eyebrow: string;
    title: string;
    intro: string;
    ctaPrimary: string;
    ctaSecondary: string;
    benefitsTitle: string;
    benefits: string[];
    priceLabel: string;
    priceNote: string;
    waysTitle: string;
    waysIntro: string;
    ways: {
      icon: string;
      badge: string;
      title: string;
      meta: string;
      text: string;
      points: string[];
    }[];
    waysNote: string;
    stepsTitle: string;
    steps: {
      n: string;
      t: string;
      d: string;
    }[];
    doubtsTitle: string;
    doubts: {
      q: string;
      a: string;
    }[];
    whoTitle: string;
    whoIntro: string;
    options: {
      title: string;
      featured?: boolean;
      badge: string;
      text: string;
      points: string[];
      cta: {
        label: string;
        href: string;
      };
    }[];
    finalTitle: string;
    finalText: string;
  }

export interface NotFoundCopy {
    title: string;
    text: string;
    links: {
      label: string;
      href: string;
      primary?: boolean;
    }[];
    searchLabel: string;
    searchCta: string;
    visit: string;
  }

export interface PremsaCopy {
    eyebrow: string;
    title: string;
    intro: string;
    kinds: {
      premsa: string;
      institucio: string;
      guia: string;
    };
    contactTitle: string;
    contactText: string;
    materialTitle: string;
    materials: {
      label: string;
      href: string;
    }[];
    finalTitle: string;
    finalText: string;
  }

export interface PreusCopy {
    eyebrow: string;
    title: string;
    intro: string;
    capitalTitle: string;
    capitalNote: string;
    capitalText: string;
    rows: {
      what: string;
      amount: string;
      when: string;
    }[];
    quotaTitle: string;
    quotaText: string;
    quotas: {
      name: string;
      amount: string;
      per: string;
      note: string;
      featured?: boolean;
    }[];
    deliveryTitle: string;
    deliveryText: string;
    deliveries: {
      what: string;
      amount: string;
    }[];
    freeTitle: string;
    free: string[];
    marginTitle: string;
    marginText: string;
    marginLink: string;
    finalTitle: string;
    finalText: string;
  }

export interface ProductesCopy {
    title: string;
    heading: string;
    intro: string;
    cats: {
      icon: string;
      title: string;
      text: string;
    }[];
    noteTitle: string;
    note: string;
    noteCta: string;
  }

export interface QuiSomCopy {
    title: string;
    intro: string;
    valuesTitle: string;
    valuesIntro: string;
    values: {
      icon: string;
      title: string;
      text: string;
    }[];
    factsTitle: string;
    facts: {
      k: string;
      v: string;
    }[];
    storyTitle: string;
    story: string[];
    govTitle: string;
    govIntro: string;
    circles: {
      icon: string;
      title: string;
      text: string;
    }[];
    membersTitle: string;
    members: {
      title: string;
      text: string;
    }[];
  }

export interface SignupCopy {
    eyebrow: string;
    title: string;
    intro: string;
    how: string;
    howNote: string;
    ways: {
      v: string;
      l: string;
    }[];
    name: string;
    phone: string;
    comments: string;
    consent: string;
    consentNote: string;
    submit: string;
    asideTitle: string;
    steps: string[];
    prefer: string;
  }

export interface TornsCopy {
    eyebrow: string;
    title: string;
    intro: string;
    cycleTitle: string;
    cycleText: string;
    tasksTitle: string;
    tasks: string[];
    tasksNote: string;
    typesTitle: string;
    types: {
      icon: string;
      t: string;
      d: string;
    }[];
    flexTitle: string;
    flex: {
      q: string;
      a: string;
    }[];
    circlesTitle: string;
    circlesText: string;
    circles: {
      t: string;
      d: string;
    }[];
    quotaTitle: string;
    quotaText: string;
    quotaLink: string;
    finalTitle: string;
    finalText: string;
  }

export interface TransparenciaCopy {
    eyebrow: string;
    title: string;
    intro: string;
    docsTitle: string;
    docs: {
      icon: string;
      t: string;
      d: string;
      href: string;
      page: string;
    }[];
    download: string;
    howTitle: string;
    how: {
      t: string;
      d: string;
    }[];
    moneyTitle: string;
    money: {
      t: string;
      d: string;
    }[];
    factsTitle: string;
    facts: {
      k: string;
      v: string;
    }[];
    finalTitle: string;
    finalText: string;
  }
