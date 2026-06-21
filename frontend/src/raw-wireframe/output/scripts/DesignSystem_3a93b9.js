/* @ds-bundle: {"format":3,"namespace":"DesignSystem_3a93b9","components":[{"name":"Mascot","sourcePath":"components/brand/Mascot.jsx"},{"name":"MascotBubble","sourcePath":"components/brand/MascotBubble.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"FilterChip","sourcePath":"components/core/FilterChip.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"PlaceCard","sourcePath":"components/data-display/PlaceCard.jsx"},{"name":"Rating","sourcePath":"components/data-display/Rating.jsx"},{"name":"Stepper","sourcePath":"components/feedback/Stepper.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/brand/Mascot.jsx":"2dc73f7be69a","components/brand/MascotBubble.jsx":"5020ad3a23b2","components/core/Badge.jsx":"0e8fac5c2ee1","components/core/Button.jsx":"40639b2a4330","components/core/FilterChip.jsx":"9aeb93a2bdef","components/core/IconButton.jsx":"b9f354f14f1a","components/data-display/Avatar.jsx":"16b8cf6a760d","components/data-display/Card.jsx":"f223ca60c587","components/data-display/PlaceCard.jsx":"b7c9724ca9cd","components/data-display/Rating.jsx":"4d6b2af654c4","components/feedback/Stepper.jsx":"5a63683d025a","components/feedback/Toast.jsx":"57df7b02f013","components/forms/Checkbox.jsx":"735e0d6ce0be","components/forms/Input.jsx":"439bd1c66571","components/forms/Select.jsx":"0e806c0c7c2d","components/forms/Switch.jsx":"9e48e5d3b922","components/forms/Textarea.jsx":"eb09d7dd85ef","components/navigation/SegmentedControl.jsx":"18285fea4579","components/navigation/Tabs.jsx":"da17b9f46f47","ui_kits/courskkok-web/AIPlanner.jsx":"08a4bb084134","ui_kits/courskkok-web/App.jsx":"0bd237742987","ui_kits/courskkok-web/CourseMap.jsx":"42bbc2074ef0","ui_kits/courskkok-web/Explore.jsx":"565f0c0be6d2","ui_kits/courskkok-web/Journal.jsx":"7a0492f77f4b","ui_kits/courskkok-web/MyTrips.jsx":"f6ed09cb561e","ui_kits/courskkok-web/Onboarding.jsx":"5f2712e23429","ui_kits/courskkok-web/PlaceDetail.jsx":"7c390d9463b2","ui_kits/courskkok-web/Shell.jsx":"731cab5d4586","ui_kits/courskkok-web/TodayTrip.jsx":"b62be38e422b","ui_kits/courskkok-web/TripLog.jsx":"a66ffc38f36a","ui_kits/courskkok-web/data.js":"2995494918f6","ui_kits/courskkok-web/icons.js":"829fcab530eb","ui_kits/courskkok-web/kit.jsx":"5fbcfddc691b"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_3a93b9 = window.DesignSystem_3a93b9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Mascot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Mascot — 콕이, the pin character. Inline SVG so it travels
 * with the component (no asset path needed). Variants & optional pop.
 *
 * Variants
 * - default : neutral friendly
 * - saved   : winking + sparkles (the 콕! moment)
 * - cheer   : both arms up, happy — celebration / success
 * - guide   : one arm raised toward a sparkle — AI guidance
 * - wink    : waving hello + wink — greetings / empty states
 */
function Mascot({
  variant = 'default',
  size = 120,
  pop = false,
  style,
  ...rest
}) {
  const w = size;
  const h = size * 1.2;
  const hasArms = variant === 'cheer' || variant === 'guide' || variant === 'wink';
  const Arms = () => {
    if (variant === 'cheer') return /*#__PURE__*/React.createElement("g", {
      fill: "#FF7A4D"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "-8.5",
      y: "0",
      width: "17",
      height: "48",
      rx: "8.5",
      transform: "translate(58 150) rotate(150)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "48",
      r: "10.5",
      transform: "translate(58 150) rotate(150)"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "-8.5",
      y: "0",
      width: "17",
      height: "48",
      rx: "8.5",
      transform: "translate(142 150) rotate(-150)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "48",
      r: "10.5",
      transform: "translate(142 150) rotate(-150)"
    }));
    if (variant === 'guide') return /*#__PURE__*/React.createElement("g", {
      fill: "#FF7A4D"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "-8",
      y: "0",
      width: "16",
      height: "40",
      rx: "8",
      transform: "translate(52 156) rotate(28)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "40",
      r: "9.5",
      transform: "translate(52 156) rotate(28)"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "-8",
      y: "0",
      width: "16",
      height: "52",
      rx: "8",
      transform: "translate(146 150) rotate(-168)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "52",
      r: "10",
      transform: "translate(146 150) rotate(-168)"
    }));
    // wink
    return /*#__PURE__*/React.createElement("g", {
      fill: "#FF7A4D"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "-8",
      y: "0",
      width: "16",
      height: "38",
      rx: "8",
      transform: "translate(50 158) rotate(22)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "38",
      r: "9.5",
      transform: "translate(50 158) rotate(22)"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "-8",
      y: "0",
      width: "16",
      height: "46",
      rx: "8",
      transform: "translate(148 148) rotate(-138)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "0",
      cy: "46",
      r: "10",
      transform: "translate(148 148) rotate(-138)"
    }));
  };
  const Sparkles = () => {
    if (variant === 'saved') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M44 70 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5 z",
      fill: "#1FBF98"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M158 50 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z",
      fill: "#FFD166"
    }));
    if (variant === 'cheer') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M150 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z",
      fill: "#FFD166"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M38 58 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 z",
      fill: "#7AD0FF"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "170",
      cy: "92",
      r: "4",
      fill: "#4FD6B2"
    }));
    if (variant === 'guide') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M158 50 l3.4 9 9 3.4 -9 3.4 -3.4 9 -3.4 -9 -9 -3.4 9 -3.4 z",
      fill: "#FFD166"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M138 36 l2 5.2 5.2 2 -5.2 2 -2 5.2 -2 -5.2 -5.2 -2 5.2 -2 z",
      fill: "#7AD0FF"
    }));
    if (variant === 'wink') return /*#__PURE__*/React.createElement("path", {
      d: "M150 44 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z",
      fill: "#FFD166"
    });
    return null;
  };
  const Face = () => {
    if (variant === 'saved') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M76 94 Q 84 86 92 94",
      stroke: "#2E2924",
      strokeWidth: "5",
      strokeLinecap: "round",
      fill: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "116",
      cy: "94",
      r: "8",
      fill: "#2E2924"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "119",
      cy: "91",
      r: "2.6",
      fill: "#FFFFFF"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M86 108 Q 100 124 114 108 Z",
      fill: "#2E2924"
    }));
    if (variant === 'cheer') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M75 96 Q 84 86 93 96",
      stroke: "#2E2924",
      strokeWidth: "5",
      strokeLinecap: "round",
      fill: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M107 96 Q 116 86 125 96",
      stroke: "#2E2924",
      strokeWidth: "5",
      strokeLinecap: "round",
      fill: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M86 108 Q 100 126 114 108 Z",
      fill: "#2E2924"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M93 116 Q 100 121 107 116 Z",
      fill: "#FF7A6B"
    }));
    if (variant === 'wink') return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "84",
      cy: "94",
      r: "8",
      fill: "#2E2924"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "87",
      cy: "91",
      r: "2.6",
      fill: "#FFFFFF"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M108 95 Q 116 88 124 95",
      stroke: "#2E2924",
      strokeWidth: "5",
      strokeLinecap: "round",
      fill: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M88 110 Q 100 121 112 110",
      stroke: "#2E2924",
      strokeWidth: "4.5",
      strokeLinecap: "round",
      fill: "none"
    }));
    // default & guide — open eyes + gentle smile
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "84",
      cy: "94",
      r: "8",
      fill: "#2E2924"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "116",
      cy: "94",
      r: "8",
      fill: "#2E2924"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "87",
      cy: "91",
      r: "2.6",
      fill: "#FFFFFF"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "119",
      cy: "91",
      r: "2.6",
      fill: "#FFFFFF"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M90 110 Q 100 120 110 110",
      stroke: "#2E2924",
      strokeWidth: "4.5",
      strokeLinecap: "round",
      fill: "none"
    }));
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-block',
      width: w,
      height: h,
      lineHeight: 0,
      animation: pop ? 'kok-pop var(--dur-slow) var(--ease-spring)' : 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 240",
    width: w,
    height: h,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    role: "img",
    "aria-label": "\uCF55\uC774"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: `kb-${variant}`,
    cx: "42%",
    cy: "34%",
    r: "78%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#FF8159"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "60%",
    stopColor: "#FF6B3D"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#F0522A"
  }))), /*#__PURE__*/React.createElement("ellipse", {
    cx: "100",
    cy: "224",
    rx: "42",
    ry: "10",
    fill: "#1A1611",
    opacity: "0.10"
  }), hasArms && /*#__PURE__*/React.createElement(Arms, null), /*#__PURE__*/React.createElement(Sparkles, null), /*#__PURE__*/React.createElement("path", {
    d: "M100 218 C 70 176 40 150 40 96 A 60 60 0 1 1 160 96 C 160 150 130 176 100 218 Z",
    fill: `url(#kb-${variant})`
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "100",
    cy: "98",
    rx: "50",
    ry: "44",
    fill: "#FFF9F4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "70",
    cy: "110",
    r: "9",
    fill: "#FFC7B0"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "130",
    cy: "110",
    r: "9",
    fill: "#FFC7B0"
  }), /*#__PURE__*/React.createElement(Face, null)));
}
Object.assign(__ds_scope, { Mascot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Mascot.jsx", error: String((e && e.message) || e) }); }

// components/brand/MascotBubble.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 MascotBubble — 콕이 next to a speech bubble. For empty states,
 * AI nudges, and onboarding tips.
 */
function MascotBubble({
  children,
  variant = 'default',
  size = 96,
  tone = 'default',
  style,
  ...rest
}) {
  const tones = {
    default: {
      bg: 'var(--surface)',
      border: 'var(--border)',
      fg: 'var(--text-primary)'
    },
    coral: {
      bg: 'var(--coral-50)',
      border: 'var(--coral-200)',
      fg: 'var(--coral-800)'
    },
    ai: {
      bg: 'var(--sky-50)',
      border: 'var(--sky-200)',
      fg: 'var(--sky-800)'
    }
  };
  const t = tones[tone] || tones.default;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'flex-end',
      gap: '4px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Mascot, {
    variant: variant,
    size: size,
    style: {
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: size * 0.18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.bg,
      color: t.fg,
      border: `1.5px solid ${t.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      fontSize: 'var(--fs-body)',
      fontFamily: 'var(--font-sans)',
      lineHeight: 'var(--lh-normal)',
      fontWeight: 'var(--fw-medium)',
      boxShadow: 'var(--shadow-sm)',
      maxWidth: 280
    }
  }, children), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: -7,
      bottom: 14,
      width: 14,
      height: 14,
      background: t.bg,
      borderLeft: `1.5px solid ${t.border}`,
      borderBottom: `1.5px solid ${t.border}`,
      transform: 'rotate(45deg)'
    }
  })));
}
Object.assign(__ds_scope, { MascotBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/MascotBubble.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Badge — compact status/category label.
 * Tones map to semantic colors; `solid` fills, default is soft.
 */
function Badge({
  children,
  tone = 'neutral',
  solid = false,
  size = 'md',
  leftIcon = null,
  style,
  ...rest
}) {
  const tones = {
    neutral: {
      soft: ['var(--gray-100)', 'var(--gray-700)'],
      solid: ['var(--gray-800)', '#fff']
    },
    coral: {
      soft: ['var(--coral-100)', 'var(--coral-700)'],
      solid: ['var(--coral-500)', '#fff']
    },
    sky: {
      soft: ['var(--sky-100)', 'var(--sky-700)'],
      solid: ['var(--sky-500)', '#fff']
    },
    mint: {
      soft: ['var(--mint-100)', 'var(--mint-700)'],
      solid: ['var(--mint-500)', '#fff']
    },
    amber: {
      soft: ['var(--amber-100)', 'var(--amber-600)'],
      solid: ['var(--amber-500)', '#fff']
    },
    red: {
      soft: ['var(--red-100)', 'var(--red-700)'],
      solid: ['var(--red-500)', '#fff']
    }
  };
  const t = tones[tone] || tones.neutral;
  const [bg, fg] = solid ? t.solid : t.soft;
  const sizes = {
    sm: {
      fs: '11px',
      pad: '2px 8px',
      h: '20px'
    },
    md: {
      fs: 'var(--fs-micro)',
      pad: '3px 10px',
      h: '24px'
    }
  };
  const s = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      height: s.h,
      padding: s.pad,
      fontSize: s.fs,
      fontWeight: 'var(--fw-semibold)',
      fontFamily: 'var(--font-sans)',
      letterSpacing: 'var(--ls-tight)',
      color: fg,
      background: bg,
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      lineHeight: 1,
      ...style
    }
  }, rest), leftIcon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Button — primary action element.
 * Variants: primary (coral), secondary (outline), ghost, ai (sky→mint), danger.
 * Sizes: sm | md | lg. Pill-shaped, springy press.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const [pressed, setPressed] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const sizes = {
    sm: {
      height: 'var(--control-sm)',
      padding: '0 14px',
      font: 'var(--fs-body-sm)',
      gap: '6px',
      icon: 16
    },
    md: {
      height: 'var(--control-md)',
      padding: '0 20px',
      font: 'var(--fs-body)',
      gap: '8px',
      icon: 18
    },
    lg: {
      height: 'var(--control-lg)',
      padding: '0 28px',
      font: 'var(--fs-body-lg)',
      gap: '8px',
      icon: 20
    }
  };
  const s = sizes[size] || sizes.md;
  const palettes = {
    primary: {
      bg: hover ? 'var(--primary-hover)' : 'var(--primary)',
      color: 'var(--on-primary)',
      border: 'transparent',
      shadow: disabled ? 'none' : 'var(--shadow-primary)'
    },
    ai: {
      bg: 'linear-gradient(120deg, var(--ai-from), var(--ai-to))',
      color: '#fff',
      border: 'transparent',
      shadow: disabled ? 'none' : 'var(--shadow-ai)',
      filter: hover ? 'brightness(1.04)' : 'none'
    },
    secondary: {
      bg: hover ? 'var(--surface-sunken)' : 'var(--surface)',
      color: 'var(--text-primary)',
      border: 'var(--border-strong)',
      shadow: 'var(--shadow-xs)'
    },
    ghost: {
      bg: hover ? 'var(--primary-soft)' : 'transparent',
      color: 'var(--primary)',
      border: 'transparent',
      shadow: 'none'
    },
    danger: {
      bg: hover ? 'var(--danger-hover)' : 'var(--danger)',
      color: 'var(--on-danger)',
      border: 'transparent',
      shadow: 'none'
    }
  };
  const p = palettes[variant] || palettes.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? '100%' : 'auto',
      font: 'inherit',
      fontSize: s.font,
      fontWeight: 'var(--fw-semibold)',
      fontFamily: 'var(--font-sans)',
      letterSpacing: 'var(--ls-tight)',
      color: p.color,
      background: p.bg,
      border: `1.5px solid ${p.border}`,
      borderRadius: 'var(--radius-pill)',
      boxShadow: p.shadow,
      filter: p.filter || 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
      transition: 'transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), leftIcon, children, rightIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/FilterChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 FilterChip — toggleable pill for category/region filters.
 * Selected = coral border + soft fill. Use in horizontal scroll rows.
 */
function FilterChip({
  children,
  selected = false,
  leftIcon = null,
  count = null,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    "aria-pressed": selected,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      height: '38px',
      padding: '0 16px',
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      fontFamily: 'var(--font-sans)',
      color: selected ? 'var(--coral-700)' : 'var(--text-secondary)',
      background: selected ? 'var(--coral-50)' : hover ? 'var(--gray-50)' : 'var(--surface)',
      border: `1.5px solid ${selected ? 'var(--coral-400)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), leftIcon, children, count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: 'var(--fw-bold)',
      color: selected ? 'var(--coral-600)' : 'var(--text-muted)'
    }
  }, count));
}
Object.assign(__ds_scope, { FilterChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/FilterChip.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 IconButton — square/round button holding a single icon.
 * Variants: soft (default), solid, ghost, glass (for use over photos).
 */
function IconButton({
  children,
  variant = 'soft',
  size = 'md',
  round = true,
  disabled = false,
  'aria-label': ariaLabel,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48
  };
  const dim = sizes[size] || sizes.md;
  const palettes = {
    soft: {
      bg: hover ? 'var(--gray-100)' : 'var(--gray-50)',
      color: 'var(--text-secondary)',
      border: 'transparent',
      shadow: 'none'
    },
    solid: {
      bg: hover ? 'var(--primary-hover)' : 'var(--primary)',
      color: 'var(--on-primary)',
      border: 'transparent',
      shadow: 'var(--shadow-sm)'
    },
    ghost: {
      bg: hover ? 'var(--gray-50)' : 'transparent',
      color: 'var(--text-secondary)',
      border: 'transparent',
      shadow: 'none'
    },
    glass: {
      bg: hover ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.82)',
      color: 'var(--gray-900)',
      border: 'transparent',
      shadow: 'var(--shadow-sm)',
      blur: true
    }
  };
  const p = palettes[variant] || palettes.soft;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": ariaLabel,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flex: 'none',
      color: p.color,
      background: p.bg,
      border: `1px solid ${p.border}`,
      borderRadius: round ? 'var(--radius-pill)' : 'var(--radius-md)',
      boxShadow: p.shadow,
      backdropFilter: p.blur ? 'blur(8px)' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transform: pressed && !disabled ? 'scale(0.92)' : 'scale(1)',
      transition: 'transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Avatar — user image with initials fallback.
 */
function Avatar({
  src,
  name = '',
  size = 40,
  ring = false,
  style,
  ...rest
}) {
  const [err, setErr] = React.useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const palette = ['var(--coral-500)', 'var(--sky-500)', 'var(--mint-500)', 'var(--amber-500)'];
  const bg = palette[(name.charCodeAt(0) || 0) % palette.length];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flex: 'none',
      borderRadius: '50%',
      overflow: 'hidden',
      background: bg,
      color: '#fff',
      fontWeight: 'var(--fw-bold)',
      fontSize: Math.round(size * 0.42),
      fontFamily: 'var(--font-sans)',
      boxShadow: ring ? '0 0 0 2px var(--surface), 0 0 0 4px var(--coral-300)' : 'none',
      ...style
    }
  }, rest), src && !err ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    onError: () => setErr(true),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initial);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Card — generic surface container. Optional hover-lift & padding.
 */
function Card({
  children,
  padding = 'md',
  interactive = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pads = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      padding: pads[padding],
      border: '1px solid var(--border-subtle)',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      cursor: interactive ? 'pointer' : 'default',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/PlaceCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 PlaceCard — the signature travel-place card.
 * Photo + category badge + 콕 save bookmark + title + rating.
 * Self-contained; pass `saved`/`onSave` to control the bookmark.
 */
function PlaceCard({
  image,
  category = '관광지',
  title,
  region,
  rating,
  reviewCount,
  meta,
  saved = false,
  onSave,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [pop, setPop] = React.useState(false);
  const catTones = {
    '관광지': ['var(--coral-100)', 'var(--coral-700)'],
    '음식점': ['var(--amber-100)', 'var(--amber-600)'],
    '숙박': ['var(--sky-100)', 'var(--sky-700)'],
    '축제': ['var(--mint-100)', 'var(--mint-700)']
  };
  const [cbg, cfg] = catTones[category] || catTones['관광지'];
  const handleSave = e => {
    e.stopPropagation();
    setPop(true);
    setTimeout(() => setPop(false), 360);
    onSave && onSave(!saved);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      transform: hover ? 'translateY(-3px)' : 'translateY(0)',
      transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      cursor: onClick ? 'pointer' : 'default',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '4 / 3',
      background: 'var(--gray-100)'
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      height: 24,
      padding: '0 10px',
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 'var(--fs-micro)',
      fontWeight: 'var(--fw-bold)',
      color: cfg,
      background: cbg,
      borderRadius: 'var(--radius-pill)'
    }
  }, category), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": saved ? '저장 취소' : '장소 저장',
    onClick: handleSave,
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 38,
      height: 38,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      background: saved ? 'var(--primary)' : 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(6px)',
      boxShadow: 'var(--shadow-sm)',
      transform: pop ? 'scale(1.18)' : 'scale(1)',
      transition: 'transform var(--dur-base) var(--ease-spring), background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: saved ? '#fff' : 'none',
    stroke: saved ? '#fff' : 'var(--gray-700)',
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--fs-title)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--ls-tight)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })), region), (rating != null || meta) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '2px'
    }
  }, rating != null && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "var(--star)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"
  })), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-primary)'
    }
  }, rating.toFixed(1)), reviewCount != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)'
    }
  }, "(", reviewCount.toLocaleString(), ")")), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)'
    }
  }, meta))));
}
Object.assign(__ds_scope, { PlaceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/PlaceCard.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Rating.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Rating — star rating for 만족도 / reviews.
 * Read-only display, or interactive when `onRate` is passed.
 */
function Rating({
  value = 0,
  max = 5,
  size = 18,
  showValue = false,
  count = null,
  onRate = null,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  const display = hover != null ? hover : value;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: '2px'
    },
    onMouseLeave: () => setHover(null)
  }, Array.from({
    length: max
  }).map((_, i) => {
    const filled = i < Math.round(display);
    return /*#__PURE__*/React.createElement(Star, {
      key: i,
      size: size,
      filled: filled,
      interactive: !!onRate,
      onMouseEnter: () => onRate && setHover(i + 1),
      onClick: () => onRate && onRate(i + 1)
    });
  })), showValue && /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-primary)'
    }
  }, value.toFixed(1)), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)'
    }
  }, "(", count.toLocaleString(), ")"));
}
function Star({
  size,
  filled,
  interactive,
  onMouseEnter,
  onClick
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    onMouseEnter: onMouseEnter,
    onClick: onClick,
    style: {
      cursor: interactive ? 'pointer' : 'default',
      display: 'block',
      flex: 'none'
    },
    fill: filled ? 'var(--star)' : 'var(--gray-200)'
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"
  }));
}
Object.assign(__ds_scope, { Rating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Rating.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Stepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Stepper — horizontal progress for onboarding & sign-up.
 * Pass total `steps` and the active index (0-based).
 */
function Stepper({
  steps = 3,
  current = 0,
  labels = null,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, Array.from({
    length: steps
  }).map((_, i) => {
    const done = i < current;
    const active = i === current;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: active ? 26 : 9,
        height: 9,
        flex: 'none',
        borderRadius: 'var(--radius-pill)',
        background: done || active ? 'var(--primary)' : 'var(--gray-200)',
        transition: 'all var(--dur-base) var(--ease-spring)'
      }
    }));
  })), labels && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--primary)'
    }
  }, current + 1), " / ", steps, " \xB7 ", labels[current]));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Toast — transient confirmation (e.g. 저장 완료).
 * Render inline for layout, or position fixed in your app shell.
 */
function Toast({
  message,
  tone = 'default',
  icon = null,
  action = null,
  style,
  ...rest
}) {
  const tones = {
    default: {
      bg: 'var(--gray-900)',
      fg: '#fff',
      accent: 'var(--coral-400)'
    },
    success: {
      bg: 'var(--gray-900)',
      fg: '#fff',
      accent: 'var(--mint-400)'
    },
    ai: {
      bg: 'var(--gray-900)',
      fg: '#fff',
      accent: 'var(--sky-400)'
    }
  };
  const t = tones[tone] || tones.default;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      maxWidth: 420,
      background: t.bg,
      color: t.fg,
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-sans)',
      animation: 'kok-fade-up var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      flex: 'none',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: t.accent,
      color: 'var(--gray-900)'
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-body)',
      fontWeight: 'var(--fw-medium)',
      lineHeight: 1.3
    }
  }, message), action && /*#__PURE__*/React.createElement("button", {
    onClick: action.onClick,
    style: {
      marginLeft: 4,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: t.accent,
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-body-sm)',
      fontFamily: 'var(--font-sans)',
      whiteSpace: 'nowrap'
    }
  }, action.label));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Checkbox — coral filled check. Works controlled or uncontrolled.
 */
function Checkbox({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  id,
  style,
  ...rest
}) {
  const autoId = React.useId();
  const inputId = id || autoId;
  const isControlled = checked != null;
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const handle = e => {
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontSize: 'var(--fs-body)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      width: 22,
      height: 22,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: handle,
    style: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: 'inherit'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 22,
      height: 22,
      borderRadius: 'var(--radius-xs)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: on ? 'var(--primary)' : 'var(--surface)',
      border: `1.5px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
      transition: 'all var(--dur-fast) var(--ease-spring)'
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })))), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Input — text field with optional label, icons, hint/error.
 */
function Input({
  label,
  hint,
  error,
  leftIcon = null,
  rightIcon = null,
  size = 'md',
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const inputId = id || autoId;
  const heights = {
    sm: 'var(--control-sm)',
    md: 'var(--control-md)',
    lg: 'var(--control-lg)'
  };
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--coral-400)' : 'var(--border)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-sans)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      height: heights[size],
      padding: '0 14px',
      background: disabled ? 'var(--gray-50)' : 'var(--surface)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus && !error ? '0 0 0 3px var(--coral-100)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      opacity: disabled ? 0.6 : 1
    }
  }, leftIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      display: 'inline-flex'
    }
  }, leftIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 'var(--fs-body)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
      minWidth: 0
    }
  }, rest)), rightIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      display: 'inline-flex'
    }
  }, rightIcon)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: error ? 'var(--danger)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Select — styled native select with chevron.
 */
function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  size = 'md',
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const inputId = id || autoId;
  const heights = {
    sm: 'var(--control-sm)',
    md: 'var(--control-md)',
    lg: 'var(--control-lg)'
  };
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--coral-400)' : 'var(--border)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: heights[size],
      background: disabled ? 'var(--gray-50)' : 'var(--surface)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus && !error ? '0 0 0 3px var(--coral-100)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      opacity: disabled ? 0.6 : 1
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: inputId,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      width: '100%',
      height: '100%',
      padding: '0 38px 0 14px',
      fontSize: 'var(--fs-body)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
      cursor: 'pointer'
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lbl = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  })), /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      right: 14,
      pointerEvents: 'none'
    },
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-muted)",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: error ? 'var(--danger)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Switch — on/off toggle (e.g. TripLog 공개여부).
 */
function Switch({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  id,
  style,
  ...rest
}) {
  const autoId = React.useId();
  const inputId = id || autoId;
  const isControlled = checked != null;
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const handle = e => {
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontSize: 'var(--fs-body)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      width: 46,
      height: 28,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: "checkbox",
    role: "switch",
    checked: on,
    disabled: disabled,
    onChange: handle,
    style: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: 'inherit'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 46,
      height: 28,
      borderRadius: 'var(--radius-pill)',
      background: on ? 'var(--primary)' : 'var(--gray-300)',
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      top: 3,
      left: on ? 21 : 3,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-base) var(--ease-spring)'
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Textarea — multi-line field for memos & TripLog reviews.
 */
function Textarea({
  label,
  hint,
  error,
  rows = 4,
  maxLength,
  value,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const inputId = id || autoId;
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--coral-400)' : 'var(--border)';
  const len = typeof value === 'string' ? value.length : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    maxLength: maxLength,
    value: value,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      resize: 'vertical',
      padding: '12px 14px',
      fontSize: 'var(--fs-body)',
      fontFamily: 'var(--font-sans)',
      lineHeight: 'var(--lh-relaxed)',
      color: 'var(--text-primary)',
      background: disabled ? 'var(--gray-50)' : 'var(--surface)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      boxShadow: focus && !error ? '0 0 0 3px var(--coral-100)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    }
  }, rest)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: error ? 'var(--danger)' : 'var(--text-muted)'
    }
  }, error || hint), maxLength && len != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)'
    }
  }, len, "/", maxLength)));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 SegmentedControl — pill toggle for 2–4 short options.
 * Animated coral thumb slides behind the active segment.
 */
function SegmentedControl({
  options = [],
  value,
  defaultValue,
  onChange,
  size = 'md',
  style,
  ...rest
}) {
  const isControlled = value != null;
  const opts = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  const [internal, setInternal] = React.useState(defaultValue ?? (opts[0] && opts[0].value));
  const active = isControlled ? value : internal;
  const idx = Math.max(0, opts.findIndex(o => o.value === active));
  const select = v => {
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  };
  const h = size === 'sm' ? 34 : 40;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      display: 'inline-flex',
      padding: 4,
      background: 'var(--gray-100)',
      borderRadius: 'var(--radius-pill)',
      height: h,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      left: 4,
      width: `calc((100% - 8px) / ${opts.length})`,
      transform: `translateX(${idx * 100}%)`,
      background: 'var(--surface)',
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform var(--dur-base) var(--ease-spring)'
    }
  }), opts.map(o => {
    const on = o.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      onClick: () => select(o.value),
      style: {
        position: 'relative',
        zIndex: 1,
        flex: 1,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '0 16px',
        fontFamily: 'var(--font-sans)',
        fontSize: size === 'sm' ? 'var(--fs-body-sm)' : 'var(--fs-body)',
        fontWeight: on ? 'var(--fw-bold)' : 'var(--fw-medium)',
        color: on ? 'var(--text-primary)' : 'var(--text-muted)',
        whiteSpace: 'nowrap',
        transition: 'color var(--dur-fast) var(--ease-out)'
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * 코스콕 Tabs — underline tab bar. Controlled via `value`/`onChange`,
 * or uncontrolled via `defaultValue`.
 */
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  style,
  ...rest
}) {
  const isControlled = value != null;
  const [internal, setInternal] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const active = isControlled ? value : internal;
  const select = v => {
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: 'var(--space-6)',
      borderBottom: '1.5px solid var(--border)',
      ...style
    }
  }, rest), items.map(it => {
    const on = it.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => select(it.value),
      style: {
        position: 'relative',
        appearance: 'none',
        border: 'none',
        background: 'none',
        padding: '12px 2px',
        cursor: 'pointer',
        fontSize: 'var(--fs-body)',
        fontFamily: 'var(--font-sans)',
        fontWeight: on ? 'var(--fw-bold)' : 'var(--fw-medium)',
        color: on ? 'var(--text-primary)' : 'var(--text-muted)',
        transition: 'color var(--dur-fast) var(--ease-out)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        fontWeight: 'var(--fw-bold)',
        color: on ? 'var(--primary)' : 'var(--text-muted)'
      }
    }, it.count), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1.5,
        height: 3,
        borderRadius: '3px 3px 0 0',
        background: on ? 'var(--primary)' : 'transparent',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/AIPlanner.jsx
try { (() => {
// 코스콕 — AI Planner (저장 장소 기반 일정 생성 + 챗봇 수정 + 이동수단·경비)
(function () {
  const {
    Icon,
    KK
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Button,
    Select,
    Badge,
    Mascot,
    SegmentedControl
  } = DS;
  const {
    won,
    catTone,
    catColor,
    MoveRow,
    CostSummary,
    DotField
  } = window.Kit;
  const CourseMap = window.CourseMap;
  const CourseMapToggle = window.CourseMapToggle;
  const clone = o => JSON.parse(JSON.stringify(o));

  // 하나의 정차지(stop)
  function Stop({
    it,
    last,
    onRemove
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 52,
        flex: 'none',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--text-secondary)',
        paddingTop: 14
      }
    }, it.time), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 13,
        height: 13,
        borderRadius: '50%',
        background: catColor[it.cat],
        border: '2.5px solid var(--surface)',
        boxShadow: '0 0 0 1.5px ' + catColor[it.cat]
      }
    }), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        width: 2,
        background: 'var(--border)',
        marginTop: 4
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        paddingBottom: last ? 4 : 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        padding: 12,
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: it.img,
      alt: "",
      style: {
        width: 58,
        height: 58,
        borderRadius: 'var(--radius-sm)',
        objectFit: 'cover',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15.5
      }
    }, it.title), /*#__PURE__*/React.createElement(Badge, {
      tone: catTone(it.cat),
      size: "sm"
    }, it.cat)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--text-muted)',
        marginTop: 3
      }
    }, it.note)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        color: it.cost ? 'var(--text-primary)' : 'var(--mint-600)'
      }
    }, it.cost ? won(it.cost) : '무료'), onRemove && /*#__PURE__*/React.createElement("button", {
      onClick: onRemove,
      "aria-label": "\uC81C\uC678",
      style: {
        border: 'none',
        background: 'var(--gray-50)',
        width: 28,
        height: 28,
        borderRadius: '50%',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 15
    }))))));
  }
  function DayTimeline({
    day,
    onRemoveItem
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '15px 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'var(--coral-500)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-primary)'
      }
    }, day.day), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--coral-600)',
        fontWeight: 800,
        letterSpacing: '0.04em'
      }
    }, "DAY ", day.day), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 17,
        whiteSpace: 'nowrap'
      }
    }, day.theme)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      size: "sm"
    }, day.items.length, "\uACF3")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '6px 18px 14px'
      }
    }, day.items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, it.move && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 52,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 13,
        flex: 'none',
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        background: 'repeating-linear-gradient(var(--sky-200) 0 5px, transparent 5px 10px)',
        flex: 1,
        margin: '3px 0'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: '7px 0'
      }
    }, /*#__PURE__*/React.createElement(MoveRow, {
      move: it.move
    }))), /*#__PURE__*/React.createElement(Stop, {
      it: it,
      last: i === day.items.length - 1,
      onRemove: onRemoveItem ? () => onRemoveItem(i) : null
    })))));
  }

  // ── 콕이 챗봇 수정 ─────────────────────────────────────────
  const QUICK = ['숙소 저렴하게 바꿔줘', '2일차에 카페 추가', '더 여유롭게', '맛집 한 곳 더'];
  function applyIntent(plan, text) {
    const p = clone(plan);
    const t = text.replace(/\s/g, '');
    // 저렴하게
    if (/(저렴|아껴|싸게|줄여|예산|비용)/.test(t)) {
      let changed = false;
      p.days.forEach(d => d.items.forEach(it => {
        if (it.cat === '숙박' && it.cost > 90000) {
          it.title = '제주 게스트하우스';
          it.note = '가성비 좋은 감성 숙소';
          it.cost = 55000;
          changed = true;
        }
      }));
      return {
        plan: p,
        reply: changed ? '숙소를 가성비 게스트하우스로 바꿨어요. 1박에 12.5만원 아꼈네요! 💸 경비가 확 줄었어요.' : '이미 알뜰한 코스예요. 식비를 줄여볼까요?'
      };
    }
    // 카페 추가
    if (/(카페|커피|디저트)/.test(t)) {
      const dayIdx = /3일|셋|day3/i.test(t) ? 2 : /2일|둘|day2/i.test(t) ? 1 : 0;
      const d = p.days[dayIdx] || p.days[0];
      d.items.splice(Math.max(1, d.items.length - 1), 0, {
        time: '16:00',
        title: '오션뷰 카페',
        cat: '음식점',
        note: '바다 보며 커피 한 잔',
        img: window.__resources && window.__resources.img_cafejeju || 'https://picsum.photos/seed/cafejeju/800/600',
        cost: 8000,
        move: {
          mode: '차',
          time: '10분',
          cost: 0
        }
      });
      return {
        plan: p,
        reply: `${d.day}일차에 바다 보이는 카페를 넣었어요 ☕ 오후 일정에 여유가 생겼죠?`
      };
    }
    // 맛집/음식 추가
    if (/(맛집|음식|먹|식당|점심|저녁)/.test(t)) {
      const d = p.days[1] || p.days[0];
      d.items.splice(d.items.length - 1, 0, {
        time: '18:30',
        title: '제주 흑돼지 맛집',
        cat: '음식점',
        note: '두툼한 근고기 한 점',
        img: window.__resources && window.__resources.img_blackpork || 'https://picsum.photos/seed/blackpork/800/600',
        cost: 22000,
        move: {
          mode: '차',
          time: '15분',
          cost: 0
        }
      });
      return {
        plan: p,
        reply: '근처 흑돼지 맛집을 추가했어요 🐷 저녁이 든든해지겠네요!'
      };
    }
    // 여유롭게 — 가장 빡빡한 날의 마지막 정차지 제거
    if (/(여유|천천|느긋|줄이|빼)/.test(t)) {
      let target = p.days.reduce((a, b) => b.items.length > a.items.length ? b : a, p.days[0]);
      if (target.items.length > 1) {
        const removed = target.items.pop();
        return {
          plan: p,
          reply: `${target.day}일차에서 '${removed.title}'를 빼서 한결 여유로워졌어요 🌿 쉬엄쉬엄 다녀오세요.`
        };
      }
    }
    return {
      plan: p,
      reply: '이렇게 적어보세요 — "숙소 저렴하게", "2일차에 카페 추가", "더 여유롭게" 처럼요. 바로 코스를 손봐드릴게요!'
    };
  }
  function ChatDock({
    plan,
    setPlan
  }) {
    const [msgs, setMsgs] = React.useState([{
      role: 'kok',
      text: '코스가 마음에 드세요? 바꾸고 싶은 점을 말해주면 제가 바로 손봐드릴게요 ✨'
    }]);
    const [text, setText] = React.useState('');
    const bodyRef = React.useRef(null);
    const send = raw => {
      const v = (raw || text).trim();
      if (!v) return;
      const {
        plan: next,
        reply
      } = applyIntent(plan, v);
      setMsgs(m => [...m, {
        role: 'me',
        text: v
      }, {
        role: 'kok',
        text: reply
      }]);
      setPlan(next);
      setText('');
      requestAnimationFrame(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--sky-100)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 18px',
        background: 'linear-gradient(100deg, var(--sky-50), var(--mint-50))',
        borderBottom: '1px solid var(--sky-100)'
      }
    }, /*#__PURE__*/React.createElement(Mascot, {
      variant: "guide",
      size: 38
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15
      }
    }, "\uCF55\uC774\uC5D0\uAC8C \uC218\uC815 \uC694\uCCAD\uD558\uAE30"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: 'var(--sky-700)',
        fontWeight: 600
      }
    }, "\uB300\uD654\uB85C \uCF54\uC2A4\uB97C \uC790\uC720\uB86D\uAC8C \uBC14\uAFD4\uBCF4\uC138\uC694"))), /*#__PURE__*/React.createElement("div", {
      ref: bodyRef,
      style: {
        maxHeight: 230,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, msgs.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        justifyContent: m.role === 'me' ? 'flex-end' : 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: '78%',
        padding: '10px 14px',
        borderRadius: 16,
        fontSize: 14.5,
        lineHeight: 1.5,
        background: m.role === 'me' ? 'var(--coral-500)' : 'var(--gray-50)',
        color: m.role === 'me' ? '#fff' : 'var(--text-primary)',
        borderBottomRightRadius: m.role === 'me' ? 4 : 16,
        borderBottomLeftRadius: m.role === 'me' ? 16 : 4
      }
    }, m.text)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 14px 12px',
        display: 'flex',
        gap: 7,
        flexWrap: 'wrap'
      }
    }, QUICK.map(q => /*#__PURE__*/React.createElement("button", {
      key: q,
      onClick: () => send(q),
      style: {
        padding: '7px 12px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--sky-200)',
        background: 'var(--sky-50)',
        color: 'var(--sky-700)',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)'
      }
    }, q))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '4px 12px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--gray-50)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px 4px 4px 16px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      value: text,
      onChange: e => setText(e.target.value),
      onKeyDown: e => e.key === 'Enter' && send(),
      placeholder: "\uC608) 3\uC77C\uCC28\uC5D0 \uCE74\uD398 \uCD94\uAC00\uD574\uC918",
      style: {
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: 14.5,
        fontFamily: 'var(--font-sans)',
        minWidth: 0
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => send(),
      "aria-label": "\uBCF4\uB0B4\uAE30",
      style: {
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: 'none',
        background: text.trim() ? 'var(--coral-500)' : 'var(--gray-200)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 17
    })))));
  }
  function AIPlanner({
    basketPlaces,
    onSavePlan,
    onNav
  }) {
    const [stage, setStage] = React.useState('setup');
    const [period, setPeriod] = React.useState('2박 3일');
    const [style, setStyle] = React.useState('힐링');
    const [pace, setPace] = React.useState('여유롭게');
    const [people, setPeople] = React.useState(2);
    const [plan, setPlan] = React.useState(() => clone(KK.aiPlan));
    const run = () => {
      setStage('loading');
      setTimeout(() => setStage('result'), 1900);
    };
    const [resultView, setResultView] = React.useState('list');
    const removeItem = (dayIdx, itemIdx) => {
      setPlan(p => {
        const n = clone(p);
        n.days[dayIdx].items.splice(itemIdx, 1);
        return n;
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 900,
        margin: '0 auto',
        padding: '32px 24px 90px'
      }
    }, stage === 'setup' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        background: 'linear-gradient(120deg, var(--sky-50), var(--mint-50) 70%)',
        padding: '26px 30px',
        marginBottom: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(DotField, {
      color: "var(--sky-200)",
      opacity: 0.5
    }), /*#__PURE__*/React.createElement(Mascot, {
      variant: "guide",
      size: 92,
      style: {
        position: 'relative',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "sky",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 12
      })
    }, "AI PLANNER"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        marginTop: 8
      }
    }, "\uCF55\uC774\uAC00 \uCF54\uC2A4\uB97C \uC9DC\uB4DC\uB9B4\uAC8C\uC694"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15.5,
        color: 'var(--text-secondary)',
        marginTop: 4
      }
    }, "\uC800\uC7A5\uD55C \uC7A5\uC18C\uC640 \uC870\uAC74\uB9CC \uC54C\uB824\uC8FC\uBA74 \uC774\uB3D9\xB7\uACBD\uBE44\uAE4C\uC9C0 \uD55C \uBC88\uC5D0!"))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
        padding: 26
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bag",
      size: 16,
      color: "var(--coral-500)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--text-secondary)'
      }
    }, "\uC5EC\uD589 \uBC14\uAD6C\uB2C8 \xB7 ", basketPlaces.length, "\uACF3")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 24
      }
    }, basketPlaces.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        fontSize: 14
      }
    }, "\uBA3C\uC800 \uC5EC\uD589\uC9C0 \uD0D0\uC0C9\uC5D0\uC11C \uC7A5\uC18C\uB97C \uB2F4\uC544\uC8FC\uC138\uC694."), basketPlaces.map(p => /*#__PURE__*/React.createElement("span", {
      key: p.id,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 12px 6px 6px',
        background: 'var(--coral-50)',
        borderRadius: 'var(--radius-pill)',
        fontSize: 13,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.img,
      alt: "",
      style: {
        width: 26,
        height: 26,
        borderRadius: '50%',
        objectFit: 'cover'
      }
    }), p.title))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 18,
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "\uC5EC\uD589 \uAE30\uAC04",
      options: ['당일치기', '1박 2일', '2박 3일', '3박 4일'],
      value: period,
      onChange: e => setPeriod(e.target.value)
    }), /*#__PURE__*/React.createElement(Select, {
      label: "\uC5EC\uD589 \uC2A4\uD0C0\uC77C",
      options: ['힐링', '액티비티', '미식', '감성'],
      value: style,
      onChange: e => setStyle(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 18,
        alignItems: 'end',
        marginBottom: 26
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: 8
      }
    }, "\uD558\uB8E8 \uC77C\uC815 \uBC00\uB3C4"), /*#__PURE__*/React.createElement(SegmentedControl, {
      options: ['여유롭게', '적당히', '알차게'],
      value: pace,
      onChange: setPace
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: 8
      }
    }, "\uC778\uC6D0"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-pill)',
        padding: 3
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setPeople(n => Math.max(1, n - 1)),
      style: stepBtn
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "minus",
      size: 16
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 16
      }
    }, people), /*#__PURE__*/React.createElement("button", {
      onClick: () => setPeople(n => Math.min(9, n + 1)),
      style: stepBtn
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16
    }))))), /*#__PURE__*/React.createElement(Button, {
      variant: "ai",
      size: "lg",
      fullWidth: true,
      disabled: basketPlaces.length === 0,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 20
      }),
      onClick: run
    }, "AI\uB85C \uCF54\uC2A4 \uC0DD\uC131\uD558\uAE30"))), stage === 'loading' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        padding: '90px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        animation: 'kok-pop 1.1s var(--ease-spring) infinite'
      }
    }, /*#__PURE__*/React.createElement(Mascot, {
      variant: "guide",
      size: 130
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 700,
        textAlign: 'center'
      }
    }, "\uC800\uC7A5\uD55C ", basketPlaces.length, "\uACF3\uC744 ", period, " ", style, " \uCF54\uC2A4\uB85C \uC9DC\uB294 \uC911\u2026"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 220,
        height: 6,
        borderRadius: 99,
        background: 'var(--gray-100)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '60%',
        height: '100%',
        borderRadius: 99,
        background: 'linear-gradient(90deg, var(--sky-500), var(--mint-400))',
        animation: 'kokload 1.9s var(--ease-out) forwards'
      }
    })), /*#__PURE__*/React.createElement("style", null, `@keyframes kokload{from{width:8%}to{width:100%}}`)), stage === 'result' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement(Mascot, {
      variant: "cheer",
      size: 72
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "sky",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 12
      })
    }, "AI \uCD94\uCC9C \uCF54\uC2A4"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 27,
        fontWeight: 800,
        marginTop: 8,
        letterSpacing: '-0.02em'
      }
    }, period, " ", style, " \uC81C\uC8FC \uCF54\uC2A4")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "undo",
        size: 16
      }),
      onClick: () => {
        setPlan(clone(KK.aiPlan));
      }
    }, "\uCC98\uC74C\uC73C\uB85C")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 18,
        fontWeight: 800
      }
    }, "\uCF54\uC2A4 \uD55C\uB208\uC5D0 \uBCF4\uAE30"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(CourseMapToggle, {
      view: resultView,
      onChange: setResultView
    })), resultView === 'map' ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement(CourseMap, {
      days: plan.days,
      height: 380
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 16,
        marginBottom: 18
      }
    }, plan.days.map((d, di) => /*#__PURE__*/React.createElement(DayTimeline, {
      key: di,
      day: d,
      onRemoveItem: ii => removeItem(di, ii)
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement(CostSummary, {
      days: plan.days,
      fixedCost: plan.fixedCost,
      people: people
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement(ChatDock, {
      plan: plan,
      setPlan: setPlan
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        position: 'sticky',
        bottom: 18
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      fullWidth: true,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "route",
        size: 18
      }),
      onClick: () => onSavePlan({
        ...plan,
        period,
        style,
        people
      })
    }, "\uC774 \uCF54\uC2A4\uB85C \uB0B4 \uC5EC\uD589 \uB9CC\uB4E4\uAE30"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "lg",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "share",
        size: 18
      })
    }, "\uACF5\uC720"))));
  }
  const stepBtn = {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: 'none',
    background: 'var(--gray-50)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  window.AIPlanner = AIPlanner;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/AIPlanner.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/App.jsx
try { (() => {
// 코스콕 — App router & state
(function () {
  let Shell, Explore, PlaceDetail, AIPlanner, MyTrips, TodayTrip, TripLogFeed, Onboarding, KK;
  function App() {
    const [onboarded, setOnboarded] = React.useState(false);
    const [view, setView] = React.useState('explore');
    const [basket, setBasket] = React.useState(() => new Map());
    const [basketOpen, setBasketOpen] = React.useState(false);
    const [place, setPlace] = React.useState(null);
    const [toast, setToast] = React.useState(null);
    const [savedTrips, setSavedTrips] = React.useState([]);
    const [activeTrip, setActiveTrip] = React.useState(null); // 오늘의 여행으로 따라가는 여행
    const toastTimer = React.useRef(null);
    const fireToast = t => {
      setToast(t);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3200);
    };
    const toggleSave = p => {
      setBasket(prev => {
        const next = new Map(prev);
        if (next.has(p.id)) {
          next.delete(p.id);
          fireToast({
            tone: 'default',
            icon: 'x',
            message: `${p.title} 저장을 취소했어요`
          });
        } else {
          next.set(p.id, p);
          fireToast({
            tone: 'success',
            icon: 'check',
            message: `${p.title}을(를) 바구니에 담았어요`,
            action: {
              label: '바구니',
              onClick: () => setBasketOpen(true)
            }
          });
        }
        return next;
      });
    };
    const removeFromBasket = id => setBasket(prev => {
      const n = new Map(prev);
      n.delete(id);
      return n;
    });
    const goPlanner = () => {
      setBasketOpen(false);
      setView('planner');
    };
    const savePlan = plan => {
      const trip = {
        ...KK.tripLogs[0],
        title: `${plan.period || '2박 3일'} ${plan.style || '힐링'} 제주 코스`,
        cover: basketPlaces[0] && basketPlaces[0].img || KK.places[0].img,
        region: '제주',
        period: plan.period || '2박 3일',
        days: plan.days && plan.days.length || 3,
        places: (plan.days ? plan.days.reduce((a, d) => a + d.items.length, 0) : basket.size) || 8,
        visibility: 'private',
        plan
      };
      setSavedTrips(p => [trip, ...p]);
      setView('trips');
      fireToast({
        tone: 'success',
        icon: 'check',
        message: '내 여행에 코스를 저장했어요 · 이제 사진과 글을 남겨보세요'
      });
    };

    // 오늘의 여행 시작
    const startTrip = trip => {
      setActiveTrip(trip);
      setView('today');
    };

    // 여행 기록 → TripLog 공개
    const publishAlbum = ({
      trip,
      visitedStops,
      cover,
      allPhotos,
      ratings
    }) => {
      const route = visitedStops.map(s => s.it.title);
      const firstMemo = (visitedStops.find(s => s.rec.memo) || {}).rec;
      const log = {
        id: 'mine-' + Date.now(),
        title: trip.title,
        author: '나',
        avatar: 'me',
        region: trip.region || '제주',
        period: trip.period || '2박 3일',
        style: '기록',
        cover,
        photos: allPhotos.length ? allPhotos : [cover],
        route,
        rating: ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10 : 5,
        likes: 0,
        saves: 0,
        comments: 0,
        days: trip.plan && trip.plan.days ? trip.plan.days.length : 3,
        places: route.length,
        date: '방금 전',
        excerpt: firstMemo && firstMemo.memo || '직접 다녀온 고의 기록이에요.'
      };
      KK.tripLogs = [log, ...KK.tripLogs];
      setView('triplog');
      fireToast({
        tone: 'success',
        icon: 'globe',
        message: 'TripLog에 여행 기록을 공개했어요'
      });
    };
    const setTripVisibility = (trip, v) => {
      setSavedTrips(p => p.map(t => t === trip || t.title === trip.title ? {
        ...t,
        visibility: v
      } : t));
      fireToast(v === 'public' ? {
        tone: 'success',
        icon: 'globe',
        message: 'TripLog에 공개했어요 · 다른 여행자가 볼 수 있어요'
      } : {
        tone: 'default',
        icon: 'lock',
        message: '비공개로 전환했어요 · 나만 볼 수 있어요'
      });
    };
    const addCourse = log => {
      // copy the log's course into the basket
      const next = new Map(basket);
      KK.places.slice(0, 6).forEach(p => next.set(p.id, p));
      setBasket(next);
      setView('planner');
      fireToast({
        tone: 'success',
        icon: 'copy',
        message: `${log.author}님의 코스를 담았어요 · AI로 다시 조정해보세요`
      });
    };
    const basketPlaces = Array.from(basket.values());
    if (!onboarded) return /*#__PURE__*/React.createElement(Onboarding, {
      onComplete: () => setOnboarded(true)
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh'
      }
    }, /*#__PURE__*/React.createElement(Shell.NavBar, {
      view: view,
      onNav: setView,
      basketCount: basket.size,
      onOpenBasket: () => setBasketOpen(true)
    }), view === 'explore' && /*#__PURE__*/React.createElement(Explore, {
      basket: basket,
      onToggleSave: toggleSave,
      onOpenPlace: setPlace
    }), view === 'planner' && /*#__PURE__*/React.createElement(AIPlanner, {
      basketPlaces: basketPlaces,
      onSavePlan: savePlan,
      onNav: setView
    }), view === 'trips' && /*#__PURE__*/React.createElement(MyTrips, {
      savedTrips: savedTrips,
      onWriteLog: () => setView('triplog'),
      onVisibility: setTripVisibility,
      onStartTrip: startTrip
    }), view === 'today' && /*#__PURE__*/React.createElement(TodayTrip, {
      trip: activeTrip,
      onPublish: publishAlbum
    }), view === 'triplog' && /*#__PURE__*/React.createElement(TripLogFeed, {
      onAddCourse: addCourse
    }), /*#__PURE__*/React.createElement(PlaceDetail, {
      place: place,
      saved: place && basket.has(place.id),
      onToggleSave: toggleSave,
      onClose: () => setPlace(null)
    }), /*#__PURE__*/React.createElement(Shell.BasketDrawer, {
      open: basketOpen,
      places: basketPlaces,
      onClose: () => setBasketOpen(false),
      onRemove: removeFromBasket,
      onPlan: goPlanner
    }), /*#__PURE__*/React.createElement(Shell.Toaster, {
      toast: toast
    }));
  }
  function mount() {
    if (window.__kkMounted) {
      return;
    }
    const keys = ['Shell', 'Explore', 'PlaceDetail', 'AIPlanner', 'MyTrips', 'TodayTrip', 'TripLogFeed', 'Onboarding', 'KK'];
    if (!keys.every(k => window[k])) {
      return setTimeout(mount, 30);
    }
    window.__kkMounted = true;
    ({
      Shell,
      Explore,
      PlaceDetail,
      AIPlanner,
      MyTrips,
      TodayTrip,
      TripLogFeed,
      Onboarding,
      KK
    } = window);
    ReactDOM.createRoot(document.getElementById('kk-root')).render(/*#__PURE__*/React.createElement(App, null));
  }
  mount();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/CourseMap.jsx
try { (() => {
// 코스콕 — CourseMap: 코스(일정)를 지도 위에 동선으로 보여주는 뷰
// 프로토타입용 스타일라이즈드 벡터 지도. 프로덕션에서는 이 자리에
// Kakao/Naver Map JS SDK 컨테이너를 끼우고 COORD를 실제 위경도로 교체하면 됨.
(function () {
  const {
    Icon
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Badge
  } = DS;

  // 데모(제주) 장소별 좌표 — 0..100(x) · 0..72(y) 캔버스 기준
  const COORD = {
    '협재 해변': {
      x: 20,
      y: 27
    },
    '오션뷰 카페': {
      x: 23,
      y: 22
    },
    '올레 국수': {
      x: 27,
      y: 33
    },
    '제주 들불축제': {
      x: 31,
      y: 41
    },
    '카멜리아 힐': {
      x: 33,
      y: 49
    },
    '바다뷰 스테이': {
      x: 45,
      y: 55
    },
    '제주 게스트하우스': {
      x: 45,
      y: 55
    },
    '사려니 숲길': {
      x: 58,
      y: 34
    },
    '제주 흑돼지 맛집': {
      x: 69,
      y: 43
    },
    '해녀의 부엌': {
      x: 75,
      y: 31
    },
    '성산일출봉': {
      x: 86,
      y: 39
    }
  };
  const fallback = i => ({
    x: 22 + i * 13 % 60,
    y: 26 + i * 19 % 30
  });
  const coordOf = (title, i) => COORD[title] || fallback(i);
  const DAYC = ['var(--coral-500)', 'var(--sky-500)', 'var(--mint-500)', 'var(--amber-500)'];
  const DAYSOFT = ['var(--coral-50)', 'var(--sky-50)', 'var(--mint-50)', 'var(--amber-50)'];

  // 지도 배경(제주 실루엣 + 바다 + 도로 + 한라산)
  function MapBackground() {
    return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("g", {
      stroke: "#BFE3FB",
      strokeWidth: "0.5",
      strokeLinecap: "round",
      opacity: "0.7",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M6 10 q3 -2 6 0 t6 0"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M78 12 q3 -2 6 0 t6 0"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 62 q3 -2 6 0 t6 0"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M80 60 q3 -2 6 0 t6 0"
    })), /*#__PURE__*/React.createElement("path", {
      d: "M12 36 C12 24 26 17 40 16 C54 15 66 16 78 20 C88 23 92 30 91 38 C90 48 78 55 62 57 C46 59 30 58 20 52 C14 48 12 42 12 36 Z",
      fill: "#FBF4EC",
      stroke: "#F2D9C8",
      strokeWidth: "0.8",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 36 C12 24 26 17 40 16 C54 15 66 16 78 20 C88 23 92 30 91 38 C90 48 78 55 62 57 C46 59 30 58 20 52 C14 48 12 42 12 36 Z",
      fill: "none",
      stroke: "#FFE9DC",
      strokeWidth: "2.4",
      strokeLinejoin: "round",
      opacity: "0.6"
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "58",
      cy: "35",
      rx: "9",
      ry: "6",
      fill: "#DDF3E8",
      opacity: "0.8"
    }), /*#__PURE__*/React.createElement("ellipse", {
      cx: "34",
      cy: "48",
      rx: "6",
      ry: "4",
      fill: "#DDF3E8",
      opacity: "0.7"
    }), /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "50",
      cy: "37",
      r: "9",
      fill: "#E7F6EE"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "50",
      cy: "37",
      r: "5.5",
      fill: "#CDEBDC"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M47 39 l3 -5 3 5 z",
      fill: "#9FD9BC"
    })), /*#__PURE__*/React.createElement("path", {
      d: "M20 34 C22 25 34 21 46 21 C60 21 74 23 82 30 C86 34 84 42 74 47 C60 53 40 53 28 48 C20 44 18 40 20 34 Z",
      fill: "none",
      stroke: "#E7D6C6",
      strokeWidth: "0.7",
      strokeDasharray: "1.4 1.6"
    }), /*#__PURE__*/React.createElement("g", {
      fill: "#CDEBDC"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "40",
      cy: "30",
      r: "1.1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "66",
      cy: "44",
      r: "1.1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "28",
      cy: "40",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "72",
      cy: "36",
      r: "1"
    })));
  }

  // days: [{day, theme, items:[{title, cat, time, img}]}]
  function CourseMap({
    days,
    activeDay = 'all',
    height = 360
  }) {
    const [sel, setSel] = React.useState(null); // {di, ii}

    // 표시할 day 목록
    const shownDays = activeDay === 'all' ? days.map((_, i) => i) : [activeDay];
    const selStop = sel ? days[sel.di] && days[sel.di].items[sel.ii] : null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        background: 'linear-gradient(165deg, #EAF6FF, #E9FBF4)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      "aria-hidden": true,
      style: {
        position: 'absolute',
        inset: 0,
        opacity: 0.35,
        backgroundImage: 'radial-gradient(#CDE8FB 1.5px, transparent 1.5px)',
        backgroundSize: '16px 16px'
      }
    }), /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 100 72",
      preserveAspectRatio: "xMidYMid meet",
      style: {
        position: 'relative',
        width: '100%',
        height,
        display: 'block'
      }
    }, /*#__PURE__*/React.createElement(MapBackground, null), shownDays.map(di => {
      const pts = days[di].items.map((it, ii) => coordOf(it.title, ii));
      if (pts.length < 2) return null;
      const d = pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
      return /*#__PURE__*/React.createElement("path", {
        key: 'r' + di,
        d: d,
        fill: "none",
        stroke: DAYC[di % 4],
        strokeWidth: "1",
        strokeDasharray: "2 1.8",
        strokeLinecap: "round",
        opacity: "0.85"
      });
    }), shownDays.map(di => days[di].items.map((it, ii) => {
      const p = coordOf(it.title, ii);
      const isSel = sel && sel.di === di && sel.ii === ii;
      return /*#__PURE__*/React.createElement("g", {
        key: di + '-' + ii,
        style: {
          cursor: 'pointer'
        },
        onClick: () => setSel(isSel ? null : {
          di,
          ii
        })
      }, isSel && /*#__PURE__*/React.createElement("circle", {
        cx: p.x,
        cy: p.y,
        r: "4.6",
        fill: DAYC[di % 4],
        opacity: "0.22"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: p.x,
        cy: p.y,
        r: isSel ? 3.2 : 2.6,
        fill: DAYC[di % 4],
        stroke: "#fff",
        strokeWidth: "0.7",
        style: {
          transition: 'r 0.15s'
        }
      }), /*#__PURE__*/React.createElement("text", {
        x: p.x,
        y: p.y + 0.9,
        textAnchor: "middle",
        fontSize: "2.4",
        fontWeight: "800",
        fill: "#fff",
        style: {
          pointerEvents: 'none',
          fontFamily: 'var(--font-sans)'
        }
      }, ii + 1));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 12,
        left: 12,
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, shownDays.map(di => /*#__PURE__*/React.createElement("span", {
      key: di,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 9px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        boxShadow: 'var(--shadow-xs)',
        fontSize: 11.5,
        fontWeight: 700,
        color: 'var(--text-secondary)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: DAYC[di % 4]
      }
    }), "DAY ", days[di].day))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12
      }
    }, selStop ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: 10,
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: DAYC[sel.di % 4],
        color: '#fff',
        fontWeight: 800,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none'
      }
    }, sel.ii + 1), /*#__PURE__*/React.createElement("img", {
      src: selStop.img,
      alt: "",
      style: {
        width: 40,
        height: 40,
        borderRadius: 'var(--radius-sm)',
        objectFit: 'cover',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 14.5,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, selStop.title), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      size: "sm"
    }, selStop.cat)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--text-muted)',
        marginTop: 2,
        whiteSpace: 'nowrap'
      }
    }, "DAY ", days[sel.di].day, " \xB7 ", selStop.time)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setSel(null),
      "aria-label": "\uB2EB\uAE30",
      style: {
        border: 'none',
        background: 'var(--gray-50)',
        width: 26,
        height: 26,
        borderRadius: '50%',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 14
    }))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: 'var(--shadow-xs)',
        fontSize: 12.5,
        fontWeight: 600,
        color: 'var(--text-secondary)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pin",
      size: 14,
      color: "var(--coral-500)"
    }), "\uBC88\uD638 \uD540\uC744 \uB20C\uB7EC \uC7A5\uC18C\uB97C \uD655\uC778\uD558\uC138\uC694")));
  }

  // 리스트/지도 토글 (재사용)
  function ViewToggle({
    view,
    onChange
  }) {
    const opts = [{
      k: 'list',
      icon: 'list',
      label: '리스트'
    }, {
      k: 'map',
      icon: 'map',
      label: '지도'
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        padding: 3,
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--border-subtle)'
      }
    }, opts.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.k,
      onClick: () => onChange(o.k),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        cursor: 'pointer',
        background: view === o.k ? 'var(--surface)' : 'transparent',
        color: view === o.k ? 'var(--coral-600)' : 'var(--text-muted)',
        fontWeight: 700,
        fontSize: 13,
        fontFamily: 'var(--font-sans)',
        whiteSpace: 'nowrap',
        boxShadow: view === o.k ? 'var(--shadow-xs)' : 'none'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: o.icon,
      size: 15
    }), o.label)));
  }
  window.CourseMap = CourseMap;
  window.CourseMapToggle = ViewToggle;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/CourseMap.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/Explore.jsx
try { (() => {
// 코스콕 — Explore (여행지 탐색)
(function () {
  const {
    Icon,
    KK
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Tabs,
    FilterChip,
    SegmentedControl,
    PlaceCard,
    Mascot
  } = DS;
  function Hero({
    query,
    onQuery
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, #FFE2D6 0%, #FFF9F4 55%, #D2E7FF 130%)',
        padding: '40px 44px',
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 560
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ds-eyebrow",
      style: {
        marginBottom: 12
      }
    }, "\uD55C\uAD6D\uAD00\uAD11\uACF5\uC0AC \uC778\uC99D \uC5EC\uD589\uC9C0 \xB7 TripLog"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 40,
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: '-0.02em'
      }
    }, "\uCF55! \uCC0D\uC5B4 \uB2F4\uB294", /*#__PURE__*/React.createElement("br", null), "\uB098\uB9CC\uC758 \uC5EC\uD589 \uCF54\uC2A4"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 17,
        color: 'var(--text-secondary)',
        marginTop: 14,
        lineHeight: 1.6
      }
    }, "\uAC00\uACE0 \uC2F6\uC740 \uC7A5\uC18C\uB97C \uC800\uC7A5\uD558\uBA74, AI\uAC00 \uC77C\uC815\uC5D0 \uB9DE\uAC8C \uCF54\uC2A4\uB97C \uB9CC\uB4E4\uC5B4\uB4DC\uB824\uC694."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 22,
        padding: '6px 6px 6px 18px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: 'var(--shadow-md)',
        maxWidth: 460
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 20,
      color: "var(--text-muted)"
    }), /*#__PURE__*/React.createElement("input", {
      value: query,
      onChange: e => onQuery(e.target.value),
      placeholder: "\uC81C\uC8FC, \uC131\uC0B0\uC77C\uCD9C\uBD09, \uACE0\uAE30\uAD6D\uC218\u2026",
      style: {
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: 16,
        fontFamily: 'var(--font-sans)',
        minWidth: 0
      }
    }), /*#__PURE__*/React.createElement("button", {
      style: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: 'none',
        background: 'var(--coral-500)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        boxShadow: 'var(--shadow-primary)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrowR",
      size: 20
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: 36,
        bottom: -8,
        opacity: 0.96
      }
    }, /*#__PURE__*/React.createElement(Mascot, {
      size: 150
    })));
  }
  function Explore({
    basket,
    onToggleSave,
    onOpenPlace
  }) {
    const [region, setRegion] = React.useState('제주');
    const [cat, setCat] = React.useState('all');
    const [sort, setSort] = React.useState('추천순');
    const [query, setQuery] = React.useState('');
    const catLabel = {
      all: null,
      spot: '관광지',
      food: '음식점',
      stay: '숙박',
      fest: '축제'
    };
    let list = KK.places.filter(p => !catLabel[cat] || p.cat === catLabel[cat]);
    if (query.trim()) list = list.filter(p => (p.title + p.region + p.tags.join()).includes(query.trim()));
    if (sort === '평점순') list = [...list].sort((a, b) => b.rating - a.rating);
    const counts = KK.places.reduce((m, p) => {
      m[p.cat] = (m[p.cat] || 0) + 1;
      return m;
    }, {});
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: '28px 24px 80px'
      }
    }, /*#__PURE__*/React.createElement(Hero, {
      query: query,
      onQuery: setQuery
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 6,
        marginBottom: 18
      }
    }, KK.regions.map(r => /*#__PURE__*/React.createElement(FilterChip, {
      key: r,
      selected: region === r,
      onClick: () => setRegion(r),
      leftIcon: r !== '전체' ? /*#__PURE__*/React.createElement(Icon, {
        name: "pin",
        size: 15
      }) : null
    }, r))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: cat,
      onChange: setCat,
      items: [{
        value: 'all',
        label: '전체'
      }, {
        value: 'spot',
        label: '관광지',
        count: counts['관광지']
      }, {
        value: 'food',
        label: '음식점',
        count: counts['음식점']
      }, {
        value: 'stay',
        label: '숙박',
        count: counts['숙박']
      }, {
        value: 'fest',
        label: '축제',
        count: counts['축제']
      }]
    }), /*#__PURE__*/React.createElement(SegmentedControl, {
      options: ['추천순', '평점순'],
      value: sort,
      onChange: setSort,
      size: "sm"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))',
        gap: 20
      }
    }, list.map(p => /*#__PURE__*/React.createElement(PlaceCard, {
      key: p.id,
      image: p.img,
      category: p.cat,
      title: p.title,
      region: p.region,
      rating: p.rating,
      reviewCount: p.reviews,
      meta: p.meta,
      saved: basket.has(p.id),
      onSave: () => onToggleSave(p),
      onClick: () => onOpenPlace(p)
    }))));
  }
  window.Explore = Explore;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/Explore.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/Journal.jsx
try { (() => {
// 코스콕 — Journal: 여행 장소별 기록(추억) CRUD 블록
(function () {
  const {
    Icon
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Button
  } = DS;
  const {
    PhotoUploader,
    StarPick
  } = window.Kit;
  const uid = () => 'e' + Math.random().toString(36).slice(2, 8);

  // 한 기록 입력/수정 폼
  function EntryEditor({
    initial,
    onSave,
    onCancel
  }) {
    const [photos, setPhotos] = React.useState(initial ? initial.photos : []);
    const [text, setText] = React.useState(initial ? initial.text : '');
    const [rating, setRating] = React.useState(initial ? initial.rating : 5);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--coral-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--coral-100)',
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--coral-700)'
      }
    }, "\uB9CC\uC871\uB3C4"), /*#__PURE__*/React.createElement(StarPick, {
      value: rating,
      onChange: setRating,
      size: 24
    })), /*#__PURE__*/React.createElement(PhotoUploader, {
      photos: photos,
      onChange: setPhotos,
      max: 4
    }), /*#__PURE__*/React.createElement("textarea", {
      value: text,
      onChange: e => setText(e.target.value),
      rows: 3,
      placeholder: "\uC774\uACF3\uC5D0\uC11C\uC758 \uC21C\uAC04\uC744 \uAE30\uB85D\uD574\uBCF4\uC138\uC694. \uBB34\uC5C7\uC774 \uC88B\uC558\uB098\uC694?",
      style: {
        width: '100%',
        marginTop: 12,
        padding: '12px 14px',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        resize: 'vertical',
        fontSize: 14.5,
        fontFamily: 'var(--font-sans)',
        lineHeight: 1.6,
        outline: 'none',
        background: 'var(--surface)',
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        justifyContent: 'flex-end',
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: onCancel
    }, "\uCDE8\uC18C"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: !text.trim() && photos.length === 0,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 15
      }),
      onClick: () => onSave({
        id: initial ? initial.id : uid(),
        photos,
        text: text.trim(),
        rating
      })
    }, initial ? '수정 완료' : '기록 저장')));
  }

  // 저장된 기록 1개 (읽기 + 수정/삭제)
  function EntryView({
    entry,
    onEdit,
    onDelete
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)',
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: photos(entry) ? 10 : 8
      }
    }, /*#__PURE__*/React.createElement(StarPick, {
      value: entry.rating,
      readOnly: true,
      size: 16
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: onEdit,
      "aria-label": "\uC218\uC815",
      style: iconBtn
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pencil",
      size: 15
    })), /*#__PURE__*/React.createElement("button", {
      onClick: onDelete,
      "aria-label": "\uC0AD\uC81C",
      style: iconBtn
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash",
      size: 15
    }))), photos(entry) && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 10,
        flexWrap: 'wrap'
      }
    }, entry.photos.map((src, i) => /*#__PURE__*/React.createElement("img", {
      key: i,
      src: src,
      alt: "",
      style: {
        width: 'calc(33.333% - 6px)',
        maxWidth: 150,
        aspectRatio: '1',
        objectFit: 'cover',
        borderRadius: 'var(--radius-md)'
      }
    }))), entry.text && /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 14.5,
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap'
      }
    }, entry.text));
  }
  const photos = e => e.photos && e.photos.length > 0;

  // 한 장소의 기록 블록 (여러 entry CRUD)
  function JournalBlock({
    entries = [],
    onChange
  }) {
    const [mode, setMode] = React.useState(null); // null | 'new' | editId

    const add = entry => {
      onChange([...(entries || []), entry]);
      setMode(null);
    };
    const update = entry => {
      onChange(entries.map(e => e.id === entry.id ? entry : e));
      setMode(null);
    };
    const del = id => onChange(entries.filter(e => e.id !== id));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, entries.map(e => mode === e.id ? /*#__PURE__*/React.createElement(EntryEditor, {
      key: e.id,
      initial: e,
      onSave: update,
      onCancel: () => setMode(null)
    }) : /*#__PURE__*/React.createElement(EntryView, {
      key: e.id,
      entry: e,
      onEdit: () => setMode(e.id),
      onDelete: () => del(e.id)
    })), mode === 'new' ? /*#__PURE__*/React.createElement(EntryEditor, {
      onSave: add,
      onCancel: () => setMode(null)
    }) : /*#__PURE__*/React.createElement("button", {
      onClick: () => setMode('new'),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        width: '100%',
        padding: '11px 0',
        borderRadius: 'var(--radius-md)',
        border: '1.5px dashed var(--coral-200)',
        background: 'transparent',
        color: 'var(--coral-600)',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 13.5,
        fontFamily: 'var(--font-sans)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "camera",
      size: 17
    }), entries.length ? '기록 더 남기기' : '사진·후기 기록하기'));
  }
  const iconBtn = {
    border: 'none',
    background: 'var(--gray-50)',
    width: 30,
    height: 30,
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  window.JournalBlock = JournalBlock;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/Journal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/MyTrips.jsx
try { (() => {
// 코스콕 — My Trips (내 여행: 편집 가능한 코스 + 장소별 기록 + 공개 설정)
(function () {
  const {
    Icon,
    KK
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Button,
    Badge,
    Card,
    Switch
  } = DS;
  const {
    catColor,
    catTone,
    MoveRow,
    DotField
  } = window.Kit;
  const JournalBlock = window.JournalBlock;
  const CourseMap = window.CourseMap;
  const CourseMapToggle = window.CourseMapToggle;
  const clone = o => JSON.parse(JSON.stringify(o));
  const uid = () => 'u' + Math.random().toString(36).slice(2, 8);

  // ── 리스트: 여행 카드 ─────────────────────────────────────
  function TripCard({
    trip,
    onOpen
  }) {
    return /*#__PURE__*/React.createElement(Card, {
      padding: "none",
      interactive: true,
      onClick: onOpen,
      style: {
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        width: 156,
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: trip.cover,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        left: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 9px',
        borderRadius: 'var(--radius-pill)',
        background: trip.visibility === 'public' ? 'var(--mint-500)' : 'rgba(26,22,17,0.6)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(4px)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: trip.visibility === 'public' ? 'globe' : 'lock',
      size: 12
    }), trip.visibility === 'public' ? '공개' : '비공개')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '16px 18px',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "coral"
    }, trip.region), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, trip.period)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 19,
        fontWeight: 700,
        letterSpacing: '-0.01em'
      }
    }, trip.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        marginTop: 10,
        color: 'var(--text-muted)',
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 5,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 15
    }), trip.days, "\uC77C"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 5,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pin",
      size: 15
    }), trip.places, "\uACF3"))), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: 'center',
        paddingRight: 16,
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronR",
      size: 22
    }))));
  }

  // ── 코스 편집 + 기록: 한 정차지 ───────────────────────────
  function StopRow({
    it,
    idx,
    count,
    journal,
    onJournal,
    onDelete,
    onMove,
    drag
  }) {
    const [open, setOpen] = React.useState((journal || []).length > 0);
    const nEntries = (journal || []).length;
    const nPhotos = (journal || []).reduce((a, e) => a + (e.photos ? e.photos.length : 0), 0);
    return /*#__PURE__*/React.createElement("div", {
      draggable: true,
      onDragStart: () => drag.start(idx),
      onDragOver: e => {
        e.preventDefault();
        drag.over(idx);
      },
      onDrop: e => {
        e.preventDefault();
        drag.drop(idx);
      },
      style: {
        background: drag.current === idx ? 'var(--coral-50)' : 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
        transition: 'background var(--dur-fast)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--gray-300)',
        cursor: 'grab',
        flex: 'none'
      },
      title: "\uB04C\uC5B4\uC11C \uC21C\uC11C \uBCC0\uACBD"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "grip2",
      size: 18
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 700,
        color: 'var(--text-secondary)',
        width: 42,
        flex: 'none'
      }
    }, it.time), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: catColor[it.cat],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("img", {
      src: it.img,
      alt: "",
      style: {
        width: 46,
        height: 46,
        borderRadius: 'var(--radius-sm)',
        objectFit: 'cover',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15
      }
    }, it.title), /*#__PURE__*/React.createElement(Badge, {
      tone: catTone(it.cat),
      size: "sm"
    }, it.cat)), it.move && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement(MoveRow, {
      move: it.move,
      compact: true
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onMove(idx, -1),
      disabled: idx === 0,
      "aria-label": "\uC704\uB85C",
      style: {
        ...miniBtn,
        opacity: idx === 0 ? 0.3 : 1
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronU",
      size: 15
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => onMove(idx, 1),
      disabled: idx === count - 1,
      "aria-label": "\uC544\uB798\uB85C",
      style: {
        ...miniBtn,
        opacity: idx === count - 1 ? 0.3 : 1
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronD",
      size: 15
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: onDelete,
      "aria-label": "\uC7A5\uC18C \uC0AD\uC81C",
      style: {
        ...miniBtn,
        color: 'var(--red-500)',
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash",
      size: 16
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(o => !o),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '9px 16px',
        border: 'none',
        borderTop: '1px solid var(--border-subtle)',
        background: open ? 'var(--coral-50)' : 'var(--gray-50)',
        cursor: 'pointer',
        color: open ? 'var(--coral-700)' : 'var(--text-secondary)',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'var(--font-sans)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "camera",
      size: 15
    }), nEntries ? `내 기록 ${nEntries}개 · 사진 ${nPhotos}장` : '이곳에서의 추억 기록하기', /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: open ? 'chevronU' : 'chevronD',
      size: 16
    })), open && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        background: 'var(--coral-50)'
      }
    }, /*#__PURE__*/React.createElement(JournalBlock, {
      entries: journal || [],
      onChange: onJournal
    })));
  }

  // ── 장소 추가 패널 ─────────────────────────────────────────
  function AddStopPanel({
    existing,
    onAdd,
    onClose
  }) {
    const have = new Set(existing);
    const candidates = KK.places.filter(p => !have.has(p.title));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px dashed var(--coral-200)',
        padding: 14,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 14
      }
    }, "\uC774 \uB0A0\uC5D0 \uCD94\uAC00\uD560 \uC7A5\uC18C"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "\uB2EB\uAE30",
      style: miniBtn
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 16
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 8
      }
    }, candidates.map(p => /*#__PURE__*/React.createElement("button", {
      key: p.id,
      onClick: () => onAdd(p),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: 8,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-sans)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.img,
      alt: "",
      style: {
        width: 38,
        height: 38,
        borderRadius: 'var(--radius-sm)',
        objectFit: 'cover',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, p.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--text-muted)'
      }
    }, p.cat)), /*#__PURE__*/React.createElement(Icon, {
      name: "plusCircle",
      size: 18,
      color: "var(--coral-500)"
    }))), candidates.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: 'var(--text-muted)',
        padding: 8
      }
    }, "\uCD94\uAC00\uD560 \uC218 \uC788\uB294 \uC7A5\uC18C\uB97C \uBAA8\uB450 \uB123\uC5C8\uC5B4\uC694.")));
  }

  // ── 상세: 코스 편집 + 기록 + 공개 설정 ───────────────────
  function TripDetail({
    trip,
    onBack,
    onVisibility,
    onStartTrip
  }) {
    const [days, setDays] = React.useState(() => clone(trip.plan && trip.plan.days ? trip.plan.days : KK.aiPlan.days).map(d => ({
      ...d,
      items: d.items.map(it => ({
        ...it,
        uid: it.uid || uid()
      }))
    })));
    const [journal, setJournal] = React.useState(() => {
      const j = {};
      days.forEach(d => d.items.forEach(it => {
        if (KK.journalSeed[it.title]) j[it.uid] = clone(KK.journalSeed[it.title]);
      }));
      return j;
    });
    const [visibility, setVisibility] = React.useState(trip.visibility || 'private');
    const [adding, setAdding] = React.useState(null); // dayIdx
    const dragRef = React.useRef({
      dayIdx: null,
      from: null
    });
    const [dragCur, setDragCur] = React.useState(null);
    const [courseView, setCourseView] = React.useState('list');
    const setJ = (u, entries) => setJournal(j => ({
      ...j,
      [u]: entries
    }));
    const totalPhotos = Object.values(journal).reduce((a, arr) => a + arr.reduce((b, e) => b + (e.photos ? e.photos.length : 0), 0), 0);
    const moveItem = (dayIdx, idx, dir) => setDays(ds => {
      const n = clone(ds);
      const arr = n[dayIdx].items;
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return ds;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return n;
    });
    const delItem = (dayIdx, idx) => setDays(ds => {
      const n = clone(ds);
      n[dayIdx].items.splice(idx, 1);
      return n;
    });
    const addItem = (dayIdx, place) => {
      setDays(ds => {
        const n = clone(ds);
        n[dayIdx].items.push({
          uid: uid(),
          time: '시간 미정',
          title: place.title,
          cat: place.cat,
          note: (place.desc || '').slice(0, 24),
          img: place.img,
          move: {
            mode: '차',
            time: '15분',
            cost: 0
          }
        });
        return n;
      });
      setAdding(null);
    };
    const makeDrag = dayIdx => ({
      current: dragRef.current.dayIdx === dayIdx ? dragCur : null,
      start: i => {
        dragRef.current = {
          dayIdx,
          from: i
        };
      },
      over: i => {
        if (dragRef.current.dayIdx === dayIdx) setDragCur(i);
      },
      drop: i => {
        const d = dragRef.current;
        if (d.dayIdx === dayIdx && d.from != null && d.from !== i) {
          setDays(ds => {
            const n = clone(ds);
            const arr = n[dayIdx].items;
            const [m] = arr.splice(d.from, 1);
            arr.splice(i, 0, m);
            return n;
          });
        }
        dragRef.current = {
          dayIdx: null,
          from: null
        };
        setDragCur(null);
      }
    });
    const applyVisibility = v => {
      setVisibility(v);
      onVisibility && onVisibility(trip, v);
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      style: backBtn
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronL",
      size: 18
    }), "\uB0B4 \uC5EC\uD589"), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: trip.cover,
      alt: "",
      style: {
        width: '100%',
        height: 190,
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(26,22,17,0.66), transparent 60%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 22,
        bottom: 18,
        right: 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "coral",
      solid: true
    }, trip.region || '제주'), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      solid: true
    }, trip.period || '2박 3일')), /*#__PURE__*/React.createElement("h1", {
      style: {
        color: '#fff',
        fontSize: 27,
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }
    }, trip.title))), /*#__PURE__*/React.createElement("button", {
      onClick: () => onStartTrip && onStartTrip(trip),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        padding: '16px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--coral-100)',
        background: 'linear-gradient(120deg, var(--coral-50), #FFF9F4 80%)',
        marginBottom: 22,
        fontFamily: 'var(--font-sans)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 12,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--coral-500)',
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sun",
      size: 24
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15.5
      }
    }, "\uC5EC\uD589 \uC2DC\uC791\uD558\uAE30"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--text-secondary)',
        marginTop: 2
      }
    }, "\uC5EC\uD589 \uB2F9\uC77C, \uB3D9\uC120\uC744 \uB530\uB77C\uAC00\uBA70 \uCF55 \uCCB4\uD06C\uC778\uD558\uACE0 \uCD94\uC5B5\uC744 \uB0A8\uACA8\uC694.")), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronR",
      size: 22,
      color: "var(--coral-400)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background: visibility === 'public' ? 'var(--mint-50)' : 'var(--surface)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 22,
        transition: 'background var(--dur-base)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 42,
        height: 42,
        borderRadius: 12,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: visibility === 'public' ? 'var(--mint-100)' : 'var(--gray-50)',
        color: visibility === 'public' ? 'var(--mint-600)' : 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: visibility === 'public' ? 'globe' : 'lock',
      size: 22
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15.5
      }
    }, visibility === 'public' ? 'TripLog에 공개 중' : '나만 보기 (비공개)'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--text-secondary)',
        marginTop: 2
      }
    }, visibility === 'public' ? '다른 여행자가 커뮤니티에서 내 코스와 기록을 볼 수 있어요.' : '공개하면 TripLog 커뮤니티에 올라가 다른 사람도 참고할 수 있어요.')), /*#__PURE__*/React.createElement(Switch, {
      checked: visibility === 'public',
      onChange: e => applyVisibility(e.target.checked ? 'public' : 'private')
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 19,
        fontWeight: 800,
        whiteSpace: 'nowrap'
      }
    }, "\uCF54\uC2A4 & \uAE30\uB85D"), /*#__PURE__*/React.createElement(Badge, {
      tone: "coral",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "image",
        size: 11
      })
    }, "\uC0AC\uC9C4 ", totalPhotos, "\uC7A5"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(CourseMapToggle, {
      view: courseView,
      onChange: setCourseView
    })), courseView === 'map' ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement(CourseMap, {
      days: days,
      height: 400
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12.5,
        color: 'var(--text-muted)',
        marginTop: 10,
        textAlign: 'center'
      }
    }, "\uB9AC\uC2A4\uD2B8\uB85C \uC804\uD658\uD558\uBA74 \uC21C\uC11C \uBCC0\uACBD\xB7\uC7A5\uC18C \uCD94\uAC00/\uC0AD\uC81C\uC640 \uCD94\uC5B5 \uAE30\uB85D\uC744 \uB0A8\uAE38 \uC218 \uC788\uC5B4\uC694.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: 14,
        textAlign: 'right'
      }
    }, "\uB04C\uAC70\uB098 \u25B2\u25BC\uB85C \uC21C\uC11C \uBCC0\uACBD \xB7 \uCD94\uAC00/\uC0AD\uC81C \uAC00\uB2A5"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginBottom: 22
      }
    }, days.map((day, di) => {
      const drag = makeDrag(di);
      return /*#__PURE__*/React.createElement("div", {
        key: di
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'var(--coral-500)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, day.day), /*#__PURE__*/React.createElement("b", {
        style: {
          fontSize: 16
        }
      }, "DAY ", day.day, " \xB7 ", day.theme)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }
      }, day.items.map((it, ii) => /*#__PURE__*/React.createElement(StopRow, {
        key: it.uid,
        it: it,
        idx: ii,
        count: day.items.length,
        journal: journal[it.uid],
        onJournal: en => setJ(it.uid, en),
        onDelete: () => delItem(di, ii),
        onMove: (i, d) => moveItem(di, i, d),
        drag: drag
      }))), adding === di ? /*#__PURE__*/React.createElement(AddStopPanel, {
        existing: day.items.map(x => x.title),
        onAdd: p => addItem(di, p),
        onClose: () => setAdding(null)
      }) : /*#__PURE__*/React.createElement("button", {
        onClick: () => setAdding(di),
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          width: '100%',
          marginTop: 10,
          padding: '11px 0',
          borderRadius: 'var(--radius-md)',
          border: '1.5px dashed var(--border)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 13.5,
          fontFamily: 'var(--font-sans)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 16
      }), day.day, "\uC77C\uCC28\uC5D0 \uC7A5\uC18C \uCD94\uAC00"));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: visibility === 'public' ? 'secondary' : 'primary',
      size: "lg",
      fullWidth: true,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: visibility === 'public' ? 'check' : 'globe',
        size: 18
      }),
      onClick: () => applyVisibility(visibility === 'public' ? 'private' : 'public')
    }, visibility === 'public' ? '공개 중 · 비공개로 전환' : 'TripLog에 공개하기'), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "lg",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "share",
        size: 18
      })
    }, "\uACF5\uC720")));
  }
  function MyTrips({
    savedTrips,
    onWriteLog,
    onVisibility,
    onStartTrip
  }) {
    const [open, setOpen] = React.useState(null);
    const trips = savedTrips && savedTrips.length ? savedTrips : [KK.tripLogs[0]];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 840,
        margin: '0 auto',
        padding: '32px 24px 90px'
      }
    }, !open ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        background: 'linear-gradient(120deg, var(--coral-50), #FFF9F4 70%)',
        padding: '24px 26px',
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement(DotField, {
      color: "var(--coral-200)",
      opacity: 0.5
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 29,
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }
    }, "\uB0B4 \uC5EC\uD589"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-secondary)',
        fontSize: 15.5,
        marginTop: 4
      }
    }, "\uCF54\uC2A4\uB97C \uB2E4\uB4EC\uACE0, \uC0AC\uC9C4\uACFC \uAE00\uB85C \uCD94\uC5B5\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694.")), /*#__PURE__*/React.createElement(Badge, {
      tone: "coral",
      solid: true,
      size: "md"
    }, trips.length, "\uAC1C\uC758 \uC5EC\uD589"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, trips.map((t, i) => /*#__PURE__*/React.createElement(TripCard, {
      key: i,
      trip: t,
      onOpen: () => setOpen(t)
    })))) : /*#__PURE__*/React.createElement(TripDetail, {
      trip: open,
      onBack: () => setOpen(null),
      onVisibility: onVisibility,
      onStartTrip: onStartTrip
    }));
  }
  const miniBtn = {
    border: 'none',
    background: 'transparent',
    width: 28,
    height: 24,
    borderRadius: 6,
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  const backBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 16
  };
  window.MyTrips = MyTrips;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/MyTrips.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/Onboarding.jsx
try { (() => {
// 코스콕 — Onboarding (4 steps) + Sign-up
(function () {
  const {
    Icon
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Button,
    Input,
    Checkbox,
    Stepper,
    Mascot
  } = DS;
  const STEPS = [{
    icon: 'compass',
    tint: 'var(--coral-500)',
    soft: 'var(--coral-50)',
    title: '여행지를 둘러보세요',
    desc: '한국관광공사가 인증한 관광지·맛집·숙소·축제를 지역과 카테고리로 쉽게 찾아봐요.'
  }, {
    icon: 'bookmark',
    tint: 'var(--mint-500)',
    soft: 'var(--mint-50)',
    title: '가고 싶은 곳을 콕 저장하세요',
    desc: '마음에 드는 장소를 여행 바구니에 콕! 담아두면 코스의 재료가 돼요.',
    mascot: 'saved'
  }, {
    icon: 'sparkles',
    tint: 'var(--sky-500)',
    soft: 'var(--sky-50)',
    title: 'AI가 코스를 만들어드려요',
    desc: '저장한 장소와 여행 기간·스타일에 맞춰 AI가 Day별 일정을 짜드려요.'
  }, {
    icon: 'copy',
    tint: 'var(--amber-500)',
    soft: 'var(--amber-50)',
    title: 'TripLog에서 코스를 담아오세요',
    desc: '다른 여행자의 기록이 마음에 들면, 그 코스를 그대로 내 계획으로 가져올 수 있어요.'
  }];
  function Scene({
    step
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 240,
        borderRadius: 'var(--radius-xl)',
        background: step.soft,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: '50%',
        border: `2px dashed ${step.tint}`,
        opacity: 0.25
      }
    }), /*#__PURE__*/React.createElement(Mascot, {
      variant: step.mascot || 'default',
      size: 130
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 26,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: step.tint
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: step.icon,
      size: 26
    })));
  }
  function SignUp({
    onDone,
    onBack
  }) {
    const [agree, setAgree] = React.useState(false);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: 14,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronL",
      size: 18
    }), "\uB4A4\uB85C"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }
    }, "\uD68C\uC6D0\uAC00\uC785"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-secondary)',
        fontSize: 15,
        marginTop: 6,
        marginBottom: 22
      }
    }, "30\uCD08\uBA74 \uB05D\uB098\uC694. \uCF55\uC774\uAC00 \uAE30\uB2E4\uB9AC\uACE0 \uC788\uC5B4\uC694!"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "\uB2C9\uB124\uC784",
      placeholder: "\uC5EC\uD589\uC790 \uB2C9\uB124\uC784",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "user",
        size: 18
      })
    }), /*#__PURE__*/React.createElement(Input, {
      label: "\uC774\uBA54\uC77C",
      type: "email",
      placeholder: "you@example.com",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "mail",
        size: 18
      })
    }), /*#__PURE__*/React.createElement(Input, {
      label: "\uBE44\uBC00\uBC88\uD638",
      type: "password",
      placeholder: "8\uC790 \uC774\uC0C1",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "lock",
        size: 18
      }),
      hint: "\uC601\uBB38\xB7\uC22B\uC790 \uD3EC\uD568 8\uC790 \uC774\uC0C1"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      label: "(\uD544\uC218) \uC774\uC6A9\uC57D\uAD00 \uBC0F \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4",
      checked: agree,
      onChange: e => setAgree(e.target.checked)
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "(\uC120\uD0DD) \uC0C8\uB85C\uC6B4 \uC5EC\uD589\uC9C0\xB7\uC774\uBCA4\uD2B8 \uC54C\uB9BC \uBC1B\uAE30"
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      fullWidth: true,
      disabled: !agree,
      onClick: onDone,
      style: {
        marginTop: 6
      }
    }, "\uCF54\uC2A4\uCF55 \uC2DC\uC791\uD558\uAE30"), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 14,
        color: 'var(--text-muted)'
      }
    }, "\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uB098\uC694? ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onDone();
      },
      style: {
        color: 'var(--coral-600)',
        fontWeight: 700
      }
    }, "\uB85C\uADF8\uC778"))));
  }
  function Onboarding({
    onComplete
  }) {
    const [i, setI] = React.useState(0);
    const signup = i >= STEPS.length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 'min(460px, 100%)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.__resources && window.__resources.markSvg || "../../assets/mark.svg",
      alt: "",
      style: {
        width: 30,
        height: 30
      }
    }), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 19,
        letterSpacing: '-0.02em'
      }
    }, "\uCF54\uC2A4", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--coral-500)'
      }
    }, "\uCF55"))), !signup && /*#__PURE__*/React.createElement("button", {
      onClick: onComplete,
      style: {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: 14,
        fontWeight: 600
      }
    }, "\uAC74\uB108\uB6F0\uAE30")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        padding: 24
      }
    }, !signup ? /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        animation: 'kok-fade-up var(--dur-base) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(Scene, {
      step: STEPS[i]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '24px 6px 8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: STEPS[i].tint,
        marginBottom: 8
      }
    }, "STEP ", i + 1), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 25,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.25
      }
    }, STEPS[i].title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 16,
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
        marginTop: 12
      }
    }, STEPS[i].desc)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement(Stepper, {
      steps: STEPS.length,
      current: i
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, i > 0 && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setI(i - 1)
    }, "\uC774\uC804"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      rightIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "arrowR",
        size: 18
      }),
      onClick: () => setI(i + 1)
    }, i === STEPS.length - 1 ? '시작하기' : '다음')))) : /*#__PURE__*/React.createElement(SignUp, {
      onDone: onComplete,
      onBack: () => setI(STEPS.length - 1)
    }))));
  }
  window.Onboarding = Onboarding;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/Onboarding.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/PlaceDetail.jsx
try { (() => {
// 코스콕 — PlaceDetail overlay
(function () {
  const {
    Icon
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Button,
    Badge,
    Rating,
    IconButton
  } = DS;
  function PlaceDetail({
    place,
    saved,
    onToggleSave,
    onClose
  }) {
    if (!place) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'fixed',
        inset: 0,
        background: 'var(--overlay-scrim)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        width: 'min(720px, 94vw)',
        margin: '48px 0',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        animation: 'kok-fade-up var(--dur-base) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 320
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: place.img,
      alt: place.title,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(26,22,17,0.5), transparent 45%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 16,
        right: 16
      }
    }, /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "\uB2EB\uAE30",
      variant: "glass",
      onClick: onClose
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 20
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 22,
        bottom: 18,
        right: 22
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "coral",
      solid: true
    }, place.cat), /*#__PURE__*/React.createElement("h1", {
      style: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 800,
        marginTop: 10,
        letterSpacing: '-0.02em'
      }
    }, place.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: 'rgba(255,255,255,0.92)',
        fontSize: 15,
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pin",
      size: 16
    }), place.region))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement(Rating, {
      value: place.rating,
      showValue: true,
      count: place.reviews,
      size: 20
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 1,
        height: 18,
        background: 'var(--border)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--text-secondary)',
        fontSize: 14
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 16,
      color: "var(--text-muted)"
    }), place.meta), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--mint-600)',
        fontSize: 14,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    }), "\uAD00\uAD11\uACF5\uC0AC \uC778\uC99D")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 16,
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
        marginBottom: 18
      }
    }, place.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 22
      }
    }, place.tags.map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      style: {
        padding: '6px 12px',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-pill)',
        fontSize: 13,
        color: 'var(--text-secondary)',
        fontWeight: 500
      }
    }, "#", t))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 150,
        borderRadius: 'var(--radius-md)',
        marginBottom: 22,
        position: 'relative',
        overflow: 'hidden',
        background: 'repeating-linear-gradient(45deg, var(--gray-50), var(--gray-50) 14px, var(--gray-100) 14px, var(--gray-100) 28px)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "map",
      size: 26
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13
      }
    }, "\uC9C0\uB3C4 \uC601\uC5ED (Kakao/\uAD00\uAD11\uACF5\uC0AC \uC88C\uD45C)"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: saved ? 'secondary' : 'primary',
      size: "lg",
      fullWidth: true,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: saved ? 'check' : 'bookmark',
        size: 18
      }),
      onClick: () => onToggleSave(place)
    }, saved ? '바구니에 담김' : '장소 저장'), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "lg",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "share",
        size: 18
      })
    }, "\uACF5\uC720")))));
  }
  window.PlaceDetail = PlaceDetail;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/PlaceDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/Shell.jsx
try { (() => {
// 코스콕 — App shell: NavBar, BasketDrawer, Toaster
(function () {
  const {
    Icon,
    KK
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Button,
    Avatar,
    Badge,
    PlaceCard
  } = DS;
  const NAV = [{
    key: 'explore',
    label: '여행지 탐색',
    icon: 'compass'
  }, {
    key: 'planner',
    label: 'AI 플래너',
    icon: 'sparkles'
  }, {
    key: 'trips',
    label: '내 여행',
    icon: 'route'
  }, {
    key: 'today',
    label: '오늘의 여행',
    icon: 'sun'
  }, {
    key: 'triplog',
    label: 'TripLog',
    icon: 'users'
  }];
  function NavBar({
    view,
    onNav,
    basketCount,
    onOpenBasket
  }) {
    return /*#__PURE__*/React.createElement("header", {
      style: {
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,249,244,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        margin: '0 auto',
        height: 68,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 24
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onNav('explore'),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: 0
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.__resources && window.__resources.markSvg || "../../assets/mark.svg",
      alt: "",
      style: {
        width: 34,
        height: 34
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        fontSize: 22,
        letterSpacing: '-0.02em',
        color: 'var(--gray-900)'
      }
    }, "\uCF54\uC2A4", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--coral-500)'
      }
    }, "\uCF55"))), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        gap: 4,
        marginLeft: 8
      }
    }, NAV.map(n => {
      const on = view === n.key;
      return /*#__PURE__*/React.createElement("button", {
        key: n.key,
        onClick: () => onNav(n.key),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height: 40,
          padding: '0 14px',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          background: on ? 'var(--coral-50)' : 'transparent',
          color: on ? 'var(--coral-700)' : 'var(--text-secondary)',
          fontWeight: on ? 700 : 500,
          fontSize: 15,
          fontFamily: 'var(--font-sans)',
          transition: 'background var(--dur-fast) var(--ease-out)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: n.icon,
        size: 18
      }), n.label);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: onOpenBasket,
      "aria-label": "\uC5EC\uD589 \uBC14\uAD6C\uB2C8",
      style: {
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bag",
      size: 20
    }), basketCount > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        padding: '0 5px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--coral-500)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-primary)'
      }
    }, basketCount)), /*#__PURE__*/React.createElement(Avatar, {
      name: "\uB098",
      size: 40,
      ring: true
    })));
  }
  function BasketDrawer({
    open,
    places,
    onClose,
    onRemove,
    onPlan
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'var(--overlay-scrim)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity var(--dur-base) var(--ease-out)'
      }
    }), /*#__PURE__*/React.createElement("aside", {
      style: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 400,
        maxWidth: '92vw',
        zIndex: 51,
        background: 'var(--bg-base)',
        boxShadow: 'var(--shadow-xl)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform var(--dur-slow) var(--ease-out)',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bag",
      size: 22,
      color: "var(--coral-500)"
    }), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 19,
        fontWeight: 800
      }
    }, "\uC5EC\uD589 \uBC14\uAD6C\uB2C8"), /*#__PURE__*/React.createElement(Badge, {
      tone: "coral",
      solid: true
    }, places.length), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "\uB2EB\uAE30",
      style: {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 22
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, places.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: 'var(--text-muted)',
        padding: '40px 0',
        fontSize: 15
      }
    }, "\uC544\uC9C1 \uB2F4\uC740 \uC7A5\uC18C\uAC00 \uC5C6\uC5B4\uC694.", /*#__PURE__*/React.createElement("br", null), "\uB9C8\uC74C\uC5D0 \uB4DC\uB294 \uACF3\uC744 \uCF55 \uCC0D\uC5B4\uBCF4\uC138\uC694.") : places.map(p => /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        display: 'flex',
        gap: 12,
        padding: 10,
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.img,
      alt: "",
      style: {
        width: 64,
        height: 64,
        borderRadius: 'var(--radius-sm)',
        objectFit: 'cover',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 15
      }
    }, p.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--text-muted)',
        marginTop: 2
      }
    }, p.region)), /*#__PURE__*/React.createElement("button", {
      onClick: () => onRemove(p.id),
      "aria-label": "\uBE7C\uAE30",
      style: {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 18
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 18,
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ai",
      size: "lg",
      fullWidth: true,
      disabled: places.length === 0,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 18
      }),
      onClick: onPlan
    }, places.length, "\uACF3\uC73C\uB85C AI \uCF54\uC2A4 \uC9DC\uAE30"))));
  }
  function Toaster({
    toast
  }) {
    if (!toast) return null;
    const {
      Toast
    } = DS;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        left: '50%',
        bottom: 36,
        transform: 'translateX(-50%)',
        zIndex: 70
      }
    }, /*#__PURE__*/React.createElement(Toast, {
      tone: toast.tone,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: toast.icon || 'check',
        size: 14
      }),
      message: toast.message,
      action: toast.action
    }));
  }
  window.Shell = {
    NavBar,
    BasketDrawer,
    Toaster,
    NAV
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/TodayTrip.jsx
try { (() => {
// 코스콕 — 오늘의 여행: 여행 중 동행(체크인) + 여행 기록(추억 앨범) → TripLog 공개
// 여정 후반부 허브. 'live'(오늘 동선 따라가며 콕! 체크인) ↔ 'album'(다녀온 곳 자동 앨범).
(function () {
  const {
    Icon,
    KK
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Button,
    Badge,
    Mascot
  } = DS;
  const {
    catColor,
    catTone,
    MoveRow,
    DotField,
    PhotoUploader,
    StarPick
  } = window.Kit;
  const keyOf = (di, ii) => di + '-' + ii;
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  // ── 도착 기록 시트(체크인 시 즉석 캡처) ─────────────────────
  function CaptureSheet({
    stop,
    onSave,
    onSkip,
    onClose
  }) {
    const [rating, setRating] = React.useState(5);
    const [photos, setPhotos] = React.useState([]);
    const [memo, setMemo] = React.useState('');
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'var(--overlay-scrim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: 460,
        maxWidth: '94vw',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        animation: 'kok-fade-up var(--dur-base) var(--ease-spring)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 116,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: stop.img,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(26,22,17,0.72), transparent 70%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 18,
        bottom: 14,
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12.5,
        fontWeight: 700,
        opacity: 0.9
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 14
    }), "\uB3C4\uCC29 \uCCB4\uD06C\uC778"), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        marginTop: 2
      }
    }, stop.title)), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "\uB2EB\uAE30",
      style: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(0,0,0,0.35)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 18
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 700
      }
    }, "\uC774\uACF3, \uC5B4\uB560\uC5B4\uC694?"), /*#__PURE__*/React.createElement(StarPick, {
      value: rating,
      onChange: setRating,
      size: 26
    })), /*#__PURE__*/React.createElement(PhotoUploader, {
      photos: photos,
      onChange: setPhotos,
      max: 3,
      tileSize: 80,
      addLabel: "\uC0AC\uC9C4"
    }), /*#__PURE__*/React.createElement("textarea", {
      value: memo,
      onChange: e => setMemo(e.target.value),
      rows: 2,
      placeholder: "\uD55C \uC904 \uBA54\uBAA8 \u2014 \uBB34\uC5C7\uC774 \uC88B\uC558\uB098\uC694? (\uC120\uD0DD)",
      style: {
        width: '100%',
        marginTop: 12,
        padding: '11px 13px',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        resize: 'vertical',
        fontSize: 14.5,
        fontFamily: 'var(--font-sans)',
        lineHeight: 1.55,
        outline: 'none',
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "lg",
      onClick: onSkip
    }, "\uAE30\uB85D \uC5C6\uC774 \uCCB4\uD06C\uC778"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 18
      }),
      onClick: () => onSave({
        rating,
        photos,
        memo: memo.trim()
      })
    }, "\uB2E4\uB140\uC654\uC5B4\uC694")))));
  }

  // ── 지금 향할 곳(다음 정차지) 카드 ──────────────────────────
  function NextStopCard({
    stop,
    idx,
    onCheckIn
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: stop.img,
      alt: "",
      style: {
        width: '100%',
        height: 290,
        objectFit: 'cover',
        display: 'block'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(26,22,17,0.84), rgba(26,22,17,0.05) 58%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 13px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(6px)',
        fontSize: 12.5,
        fontWeight: 800,
        color: 'var(--coral-600)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--coral-500)',
        boxShadow: '0 0 0 0 var(--coral-500)',
        animation: 'kok-pulse 1.8s infinite'
      }
    }), "\uC9C0\uAE08 \uD5A5\uD560 \uACF3"), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 18,
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: 'var(--coral-500)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none'
      }
    }, idx + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        opacity: 0.92
      }
    }, stop.time), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontWeight: 700
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: catColor[stop.cat]
      }
    }), stop.cat)), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }
    }, stop.title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 14.5,
        opacity: 0.9,
        marginTop: 4
      }
    }, stop.note), stop.move && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        marginTop: 12,
        padding: '7px 13px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(255,255,255,0.16)',
        backdropFilter: 'blur(4px)',
        fontSize: 13,
        fontWeight: 700
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: (KK.moveModes[stop.move.mode] || {}).icon || 'car',
      size: 16
    }), (KK.moveModes[stop.move.mode] || {}).label || stop.move.mode, " \xB7 ", stop.move.time), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      fullWidth: true,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "pin",
        size: 18
      }),
      onClick: onCheckIn
    }, "\uC5EC\uAE30 \uB3C4\uCC29! \uCF55 \uCCB4\uD06C\uC778"))));
  }

  // ── 오늘 동선 리스트(상태 표시) ────────────────────────────
  function TodayList({
    items,
    di,
    visited
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, items.map((it, ii) => {
      const rec = visited[keyOf(di, ii)];
      const done = !!rec;
      const isNext = !done && items.slice(0, ii).every((_, k) => visited[keyOf(di, k)]);
      return /*#__PURE__*/React.createElement("div", {
        key: ii,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 4px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 'none'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 30,
          height: 30,
          borderRadius: '50%',
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 13,
          background: done ? 'var(--mint-500)' : isNext ? 'var(--coral-500)' : 'var(--gray-100)',
          color: done || isNext ? '#fff' : 'var(--text-muted)',
          boxShadow: isNext ? '0 0 0 4px var(--coral-50)' : 'none'
        }
      }, done ? /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 16
      }) : ii + 1), ii < items.length - 1 && /*#__PURE__*/React.createElement("span", {
        style: {
          width: 2,
          height: 22,
          background: done ? 'var(--mint-200)' : 'var(--border)',
          marginTop: 2
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 46,
          height: 46,
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          flex: 'none',
          position: 'relative'
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: rec && rec.photos && rec.photos[0] || it.img,
        alt: "",
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: done ? 'none' : isNext ? 'none' : 'grayscale(0.35) opacity(0.7)'
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, /*#__PURE__*/React.createElement("b", {
        style: {
          fontSize: 15,
          color: done || isNext ? 'var(--text-primary)' : 'var(--text-muted)'
        }
      }, it.title), done && rec.rating ? /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          fontSize: 12.5,
          fontWeight: 700,
          color: 'var(--amber-600)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "star",
        size: 13
      }), rec.rating) : null), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          color: 'var(--text-muted)',
          marginTop: 1
        }
      }, it.time, " \xB7 ", done ? '다녀옴' : isNext ? '다음 차례' : '예정')));
    }));
  }

  // ── 여행 기록(앨범) 모드 ───────────────────────────────────
  function AlbumStop({
    it,
    rec,
    onMemo
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 11,
        borderRadius: '50%',
        background: catColor[it.cat],
        border: '2.5px solid var(--surface)',
        boxShadow: '0 0 0 1.5px ' + catColor[it.cat]
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        width: 2,
        background: 'var(--border)',
        marginTop: 4
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        paddingBottom: 22,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 700,
        color: 'var(--text-muted)'
      }
    }, it.time), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 16
      }
    }, it.title), /*#__PURE__*/React.createElement(Badge, {
      tone: catTone(it.cat),
      size: "sm"
    }, it.cat), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(StarPick, {
      value: rec.rating || 0,
      readOnly: true,
      size: 15
    })), rec.photos && rec.photos.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(rec.photos.length, 3)}, 1fr)`,
        gap: 7,
        marginBottom: 10
      }
    }, rec.photos.map((src, i) => /*#__PURE__*/React.createElement("img", {
      key: i,
      src: src,
      alt: "",
      style: {
        width: '100%',
        aspectRatio: '1',
        objectFit: 'cover',
        borderRadius: 'var(--radius-md)'
      }
    }))), /*#__PURE__*/React.createElement("textarea", {
      value: rec.memo || '',
      onChange: e => onMemo(e.target.value),
      rows: 2,
      placeholder: "\uC774\uACF3\uC5D0\uC11C\uC758 \uCD94\uC5B5\uC744 \uC801\uC5B4\uBCF4\uC138\uC694\u2026",
      style: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        resize: 'vertical',
        fontSize: 14,
        fontFamily: 'var(--font-sans)',
        lineHeight: 1.6,
        outline: 'none',
        boxSizing: 'border-box',
        background: 'var(--gray-50)'
      }
    })));
  }
  function Album({
    trip,
    days,
    visited,
    onMemo,
    onPublish
  }) {
    const visitedStops = [];
    days.forEach((d, di) => d.items.forEach((it, ii) => {
      const r = visited[keyOf(di, ii)];
      if (r) visitedStops.push({
        di,
        ii,
        it,
        rec: r
      });
    }));
    const allPhotos = visitedStops.flatMap(s => s.rec.photos || []);
    const ratings = visitedStops.map(s => s.rec.rating).filter(Boolean);
    const cover = allPhotos[0] || trip.cover || visitedStops[0] && visitedStops[0].it.img;
    if (visitedStops.length === 0) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }
      }, /*#__PURE__*/React.createElement(Mascot, {
        variant: "wink",
        size: 92
      }), /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 15.5,
          marginTop: 12,
          lineHeight: 1.6
        }
      }, "\uC544\uC9C1 \uB2E4\uB140\uC628 \uACF3\uC774 \uC5C6\uC5B4\uC694.", /*#__PURE__*/React.createElement("br", null), "\uC624\uB298 \uC77C\uC815\uC5D0\uC11C \uCF55 \uCCB4\uD06C\uC778\uD558\uBA74 \uC774\uACF3\uC5D0 \uCD94\uC5B5\uC774 \uC313\uC5EC\uC694."));
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: cover,
      alt: "",
      style: {
        width: '100%',
        height: 200,
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(26,22,17,0.78), transparent 64%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 22,
        right: 22,
        bottom: 18,
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "mint",
      solid: true,
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "image",
        size: 12
      })
    }, "\uC5EC\uD589 \uAE30\uB85D"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 27,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        marginTop: 8
      }
    }, trip.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        marginTop: 8,
        fontSize: 13.5,
        fontWeight: 600,
        opacity: 0.94
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 5,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pin",
      size: 15
    }), visitedStops.length, "\uACF3 \uB2E4\uB140\uC634"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 5,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "camera",
      size: 15
    }), "\uC0AC\uC9C4 ", allPhotos.length, "\uC7A5"), ratings.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        gap: 5,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "star",
      size: 15
    }), "\uD3C9\uADE0 ", avg(ratings).toFixed(1))))), days.map((d, di) => {
      const stops = d.items.map((it, ii) => ({
        it,
        ii,
        rec: visited[keyOf(di, ii)]
      })).filter(s => s.rec);
      if (!stops.length) return null;
      return /*#__PURE__*/React.createElement("div", {
        key: di,
        style: {
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'var(--coral-500)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, d.day), /*#__PURE__*/React.createElement("b", {
        style: {
          fontSize: 16.5
        }
      }, "DAY ", d.day, " \xB7 ", d.theme)), stops.map(s => /*#__PURE__*/React.createElement(AlbumStop, {
        key: s.ii,
        it: s.it,
        rec: s.rec,
        onMemo: v => onMemo(keyOf(di, s.ii), v)
      })));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '18px 20px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--mint-50)',
        border: '1px solid var(--mint-100)',
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement(Mascot, {
      variant: "cheer",
      size: 56,
      style: {
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15.5
      }
    }, "\uC774 \uAE30\uB85D, \uB2E4\uB978 \uC5EC\uD589\uC790\uC640 \uB098\uB220\uBCFC\uAE4C\uC694?"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: 'var(--text-secondary)',
        marginTop: 2
      }
    }, "TripLog\uC5D0 \uC62C\uB9AC\uBA74 \uB0B4 \uCF54\uC2A4\uC640 \uC0AC\uC9C4\uC774 \uCEE4\uBBA4\uB2C8\uD2F0\uC5D0 \uACF5\uC720\uB3FC\uC694.")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "globe",
        size: 18
      }),
      onClick: () => onPublish({
        trip,
        visitedStops,
        cover,
        allPhotos,
        ratings
      })
    }, "TripLog\uC5D0 \uACF5\uAC1C")));
  }

  // ── 메인 ───────────────────────────────────────────────────
  function TodayTrip({
    trip,
    onPublish,
    onBack
  }) {
    const baseTrip = trip || {
      title: '제주 힐링 코스',
      cover: KK.places[0].img,
      region: '제주',
      period: '2박 3일'
    };
    const days = baseTrip.plan && baseTrip.plan.days || KK.aiPlan.days;
    const [mode, setMode] = React.useState('live'); // live | album
    const [di, setDi] = React.useState(0);
    const [visited, setVisited] = React.useState({});
    const [capture, setCapture] = React.useState(null); // {di, ii}

    const items = days[di].items;
    const nextIi = items.findIndex((_, ii) => !visited[keyOf(di, ii)]);
    const nextStop = nextIi >= 0 ? items[nextIi] : null;
    const doneCount = items.filter((_, ii) => visited[keyOf(di, ii)]).length;
    const totalVisited = Object.keys(visited).length;
    const totalStops = days.reduce((a, d) => a + d.items.length, 0);
    const commit = rec => {
      setVisited(v => ({
        ...v,
        [keyOf(capture.di, capture.ii)]: rec
      }));
      setCapture(null);
    };
    const setMemo = (k, val) => setVisited(v => ({
      ...v,
      [k]: {
        ...v[k],
        memo: val
      }
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 880,
        margin: '0 auto',
        padding: '28px 24px 90px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 18,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ds-eyebrow",
      style: {
        marginBottom: 4
      }
    }, baseTrip.region, " \xB7 ", baseTrip.period), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 27,
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }
    }, baseTrip.title)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        padding: 4,
        background: 'var(--gray-100)',
        borderRadius: 'var(--radius-pill)',
        flex: 'none'
      }
    }, [{
      k: 'live',
      icon: 'pin',
      label: '오늘 일정'
    }, {
      k: 'album',
      icon: 'image',
      label: `여행 기록${totalVisited ? ' ' + totalVisited : ''}`
    }].map(o => /*#__PURE__*/React.createElement("button", {
      key: o.k,
      onClick: () => setMode(o.k),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '8px 16px',
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        cursor: 'pointer',
        background: mode === o.k ? 'var(--surface)' : 'transparent',
        color: mode === o.k ? 'var(--coral-600)' : 'var(--text-secondary)',
        fontWeight: 700,
        fontSize: 14,
        fontFamily: 'var(--font-sans)',
        whiteSpace: 'nowrap',
        boxShadow: mode === o.k ? 'var(--shadow-xs)' : 'none',
        transition: 'background var(--dur-fast)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: o.icon,
      size: 16
    }), o.label)))), mode === 'live' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 18,
        flexWrap: 'wrap'
      }
    }, days.map((d, i) => {
      const dDone = d.items.every((_, ii) => visited[keyOf(i, ii)]);
      return /*#__PURE__*/React.createElement("button", {
        key: i,
        onClick: () => setDi(i),
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 38,
          padding: '0 15px',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          border: '1px solid ' + (di === i ? 'transparent' : 'var(--border)'),
          background: di === i ? 'var(--coral-500)' : 'var(--surface)',
          color: di === i ? '#fff' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: 14,
          fontFamily: 'var(--font-sans)'
        }
      }, dDone && /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 15,
        color: di === i ? '#fff' : 'var(--mint-500)'
      }), "DAY ", d.day);
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        color: 'var(--text-secondary)'
      }
    }, "\uC624\uB298 ", doneCount, "/", items.length, " \uACF3")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 8,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--gray-100)',
        overflow: 'hidden',
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: `${doneCount / items.length * 100}%`,
        background: 'linear-gradient(90deg, var(--coral-400), var(--coral-500))',
        borderRadius: 'var(--radius-pill)',
        transition: 'width var(--dur-slow) var(--ease-spring)'
      }
    })), nextStop ? /*#__PURE__*/React.createElement(NextStopCard, {
      stop: nextStop,
      idx: nextIi,
      onCheckIn: () => setCapture({
        di,
        ii: nextIi
      })
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        textAlign: 'center',
        padding: '36px 24px',
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, var(--mint-50), var(--sky-50))',
        border: '1px solid var(--mint-100)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(DotField, {
      color: "var(--mint-200)",
      opacity: 0.5
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(Mascot, {
      variant: "cheer",
      size: 104,
      pop: true
    }), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 23,
        fontWeight: 800,
        marginTop: 8,
        letterSpacing: '-0.02em'
      }
    }, "DAY ", days[di].day, " \uCF54\uC2A4\uB97C \uBAA8\uB450 \uB2E4\uB140\uC654\uC5B4\uC694!"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15,
        color: 'var(--text-secondary)',
        marginTop: 6
      }
    }, "\uC624\uB298\uC758 \uCD94\uC5B5\uC774 \uC5EC\uD589 \uAE30\uB85D\uC5D0 \uCC28\uACE1\uCC28\uACE1 \uB2F4\uACBC\uC5B4\uC694."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        marginTop: 18,
        flexWrap: 'wrap'
      }
    }, di < days.length - 1 && /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "lg",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "arrowR",
        size: 18
      }),
      onClick: () => setDi(di + 1)
    }, "\uB2E4\uC74C \uB0A0 \uC77C\uC815 \uBCF4\uAE30"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "image",
        size: 18
      }),
      onClick: () => setMode('album')
    }, "\uC5EC\uD589 \uAE30\uB85D \uBCF4\uAE30")))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 26
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 16.5,
        fontWeight: 800
      }
    }, "DAY ", days[di].day, " \uB3D9\uC120"), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      size: "sm"
    }, days[di].theme)), /*#__PURE__*/React.createElement(TodayList, {
      items: items,
      di: di,
      visited: visited
    }))) : /*#__PURE__*/React.createElement(Album, {
      trip: baseTrip,
      days: days,
      visited: visited,
      onMemo: setMemo,
      onPublish: onPublish
    }), capture && /*#__PURE__*/React.createElement(CaptureSheet, {
      stop: days[capture.di].items[capture.ii],
      onSave: commit,
      onSkip: () => commit({
        rating: 0,
        photos: [],
        memo: ''
      }),
      onClose: () => setCapture(null)
    }));
  }
  window.TodayTrip = TodayTrip;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/TodayTrip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/TripLog.jsx
try { (() => {
// 코스콕 — TripLog (커뮤니티 공유 + 댓글 + 코스 담기)
(function () {
  const {
    Icon,
    KK
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Button,
    Badge,
    Avatar,
    FilterChip,
    Rating,
    Card,
    Mascot
  } = DS;
  const {
    DotField
  } = window.Kit;
  function Stat({
    icon,
    n
  }) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        color: 'var(--text-muted)',
        fontSize: 13,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 15
    }), n);
  }

  // 여러 장의 추억 사진 모자이크 (장소 카드의 단일 이미지와 구분되는 핵심)
  function PhotoCollage({
    photos,
    days
  }) {
    const ph = (photos && photos.length ? photos : []).slice(0, 4);
    const [big, ...rest] = ph;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: rest.length ? '1.7fr 1fr' : '1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 3,
        height: 188,
        background: 'var(--gray-100)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: big,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        gridRow: '1 / 3'
      }
    }), rest.slice(0, 2).map((src, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'relative',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), i === 1 && photos.length > 3 && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(26,22,17,0.5)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 17
      }
    }, "+", photos.length - 3))), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        left: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 10px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(26,22,17,0.62)',
        color: '#fff',
        fontSize: 11.5,
        fontWeight: 700,
        backdropFilter: 'blur(4px)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "image",
      size: 13
    }), "\uC5EC\uD589 \uAE30\uB85D \xB7 \uC0AC\uC9C4 ", photos.length, "\uC7A5"));
  }

  // 코스 경로 미리보기 — '한 장소'가 아니라 '코스 전체'임을 보여줌
  function RoutePreview({
    route,
    total
  }) {
    const shown = (route || []).slice(0, 3);
    const extra = (total || route.length) - shown.length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        padding: '10px 12px',
        background: 'var(--coral-50)',
        borderRadius: 'var(--radius-md)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "route",
      size: 16,
      color: "var(--coral-600)"
    }), shown.map((p, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, i > 0 && /*#__PURE__*/React.createElement(Icon, {
      name: "chevronR",
      size: 13,
      color: "var(--coral-300)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12.5,
        fontWeight: 600,
        color: 'var(--coral-700)',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: 'var(--coral-500)'
      }
    }), p))), extra > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 700,
        color: 'var(--coral-500)'
      }
    }, "\uC678 ", extra, "\uACF3"));
  }
  function LogCard({
    log,
    onOpen,
    onAddCourse
  }) {
    return /*#__PURE__*/React.createElement("article", {
      onClick: onOpen,
      style: {
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)'
      },
      onMouseEnter: e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: log.author,
      size: 36,
      ring: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700
      }
    }, log.author, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        fontWeight: 500
      }
    }, "\uB2D8\uC758 \uC5EC\uD589\uAE30")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--text-muted)'
      }
    }, log.date, " \xB7 ", log.region, " ", log.period)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 9px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--amber-50)',
        color: 'var(--amber-600)',
        fontSize: 12.5,
        fontWeight: 800
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "star",
      size: 13
    }), log.rating)), /*#__PURE__*/React.createElement(PhotoCollage, {
      photos: log.photos,
      days: log.days
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 15,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 17.5,
        fontWeight: 800,
        letterSpacing: '-0.01em',
        lineHeight: 1.32
      }
    }, log.title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 13.5,
        color: 'var(--text-secondary)',
        marginTop: 6,
        lineHeight: 1.55,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }
    }, log.excerpt)), /*#__PURE__*/React.createElement(RoutePreview, {
      route: log.route,
      total: log.places
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginTop: 'auto',
        paddingTop: 12,
        borderTop: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement(Stat, {
      icon: "heart",
      n: log.likes
    }), /*#__PURE__*/React.createElement(Stat, {
      icon: "message",
      n: log.comments
    }), /*#__PURE__*/React.createElement(Stat, {
      icon: "bookmark",
      n: log.saves
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "copy",
        size: 15
      }),
      onClick: e => {
        e.stopPropagation();
        onAddCourse && onAddCourse(log);
      }
    }, "\uCF54\uC2A4 \uB2F4\uAE30"))));
  }
  function Comment({
    c
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        padding: '14px 0',
        borderBottom: '1px solid var(--border-subtle)'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: c.author,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 14
      }
    }, c.author), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--text-muted)'
      }
    }, c.time)), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15,
        color: 'var(--text-secondary)',
        marginTop: 4,
        lineHeight: 1.55
      }
    }, c.text), /*#__PURE__*/React.createElement("button", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: 13,
        marginTop: 6,
        padding: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "heart",
      size: 14
    }), c.likes)));
  }
  function LogDetail({
    log,
    onBack,
    onAddCourse
  }) {
    const days = KK.aiPlan.days;
    const [text, setText] = React.useState('');
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 720,
        margin: '0 auto'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronL",
      size: 18
    }), "TripLog"), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        height: 300
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: log.cover,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(26,22,17,0.6), transparent 50%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 24,
        bottom: 20,
        right: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "coral",
      solid: true
    }, log.region), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      solid: true
    }, log.period), /*#__PURE__*/React.createElement(Badge, {
      tone: "mint",
      solid: true
    }, log.style)), /*#__PURE__*/React.createElement("h1", {
      style: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }
    }, log.title))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '18px 0',
        borderBottom: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: log.author,
      size: 42
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15
      }
    }, log.author), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--text-muted)'
      }
    }, log.days, "\uC77C \xB7 ", log.places, "\uACF3 \uBC29\uBB38")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "heart",
        size: 16
      })
    }, log.likes), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "copy",
        size: 16
      }),
      onClick: () => onAddCourse(log)
    }, "\uCF54\uC2A4 \uB2F4\uAE30")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '22px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }
    }, days.map(day => /*#__PURE__*/React.createElement("div", {
      key: day.day
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'var(--coral-500)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, day.day), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 17
      }
    }, "DAY ", day.day, " \xB7 ", day.theme)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        paddingLeft: 8,
        borderLeft: '2px solid var(--border)'
      }
    }, day.items.slice(0, 2).map((it, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        paddingLeft: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15
      }
    }, it.title), /*#__PURE__*/React.createElement(Rating, {
      value: 5 - i * 0.5,
      size: 14
    })), /*#__PURE__*/React.createElement("img", {
      src: it.img,
      alt: "",
      style: {
        width: '100%',
        height: 200,
        objectFit: 'cover',
        borderRadius: 'var(--radius-md)'
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15,
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
        marginTop: 10
      }
    }, it.note, ". \uC0AC\uC9C4\uBCF4\uB2E4 \uC2E4\uBB3C\uC774 \uD6E8\uC52C \uC88B\uC558\uC5B4\uC694. \uB2E4\uC74C\uC5D0 \uB610 \uC624\uACE0 \uC2F6\uC740 \uACF3 \uD83D\uDC4D"))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 8
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 19,
        fontWeight: 800,
        marginBottom: 8
      }
    }, "\uB313\uAE00 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--coral-500)'
      }
    }, KK.comments.length)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        padding: '14px 0'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "\uB098",
      size: 36,
      ring: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px 4px 4px 16px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      value: text,
      onChange: e => setText(e.target.value),
      placeholder: "\uC774 \uC5EC\uD589\uC5D0 \uB313\uAE00\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694",
      style: {
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: 15,
        fontFamily: 'var(--font-sans)'
      }
    }), /*#__PURE__*/React.createElement("button", {
      "aria-label": "\uB4F1\uB85D",
      style: {
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: 'none',
        background: text ? 'var(--coral-500)' : 'var(--gray-200)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        transition: 'background var(--dur-fast)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrowR",
      size: 18
    })))), KK.comments.map(c => /*#__PURE__*/React.createElement(Comment, {
      key: c.id,
      c: c
    }))));
  }
  function TripLogFeed({
    onAddCourse
  }) {
    const [open, setOpen] = React.useState(null);
    const [region, setRegion] = React.useState('전체');
    const filters = ['전체', '제주', '부산', '강릉', '경주'];
    const styleFilters = ['힐링', '미식', '감성', '액티비티'];
    if (open) return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 24px 90px'
      }
    }, /*#__PURE__*/React.createElement(LogDetail, {
      log: open,
      onBack: () => setOpen(null),
      onAddCourse: l => {
        onAddCourse(l);
        setOpen(null);
      }
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 24px 90px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        background: 'linear-gradient(120deg, var(--mint-50), var(--sky-50) 80%)',
        padding: '24px 28px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(DotField, {
      color: "var(--mint-200)",
      opacity: 0.55
    }), /*#__PURE__*/React.createElement(Mascot, {
      variant: "wink",
      size: 76,
      style: {
        position: 'relative',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "mint",
      leftIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "users",
        size: 12
      })
    }, "TRIPLOG \uCEE4\uBBA4\uB2C8\uD2F0"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        marginTop: 8
      }
    }, "\uC5EC\uD589\uC790\uB4E4\uC758 \uC9C4\uC9DC \uC5EC\uD589 \uAE30\uB85D"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-secondary)',
        fontSize: 15,
        marginTop: 4
      }
    }, "\uC0AC\uC9C4\uACFC \uD6C4\uAE30\uAC00 \uB2F4\uAE34 \uCF54\uC2A4\uB97C \uAD6C\uACBD\uD558\uACE0, \uB9C8\uC74C\uC5D0 \uB4E4\uBA74 \uADF8\uB300\uB85C \uB2F4\uC544\uC624\uC138\uC694."))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 10
      }
    }, filters.map(r => /*#__PURE__*/React.createElement(FilterChip, {
      key: r,
      selected: region === r,
      onClick: () => setRegion(r),
      leftIcon: r !== '전체' ? /*#__PURE__*/React.createElement(Icon, {
        name: "pin",
        size: 15
      }) : null
    }, r)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 1,
        background: 'var(--border)',
        margin: '4px 4px'
      }
    }), styleFilters.map(s => /*#__PURE__*/React.createElement(FilterChip, {
      key: s
    }, s))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: 20,
        marginTop: 16
      }
    }, KK.tripLogs.map(log => /*#__PURE__*/React.createElement(LogCard, {
      key: log.id,
      log: log,
      onOpen: () => setOpen(log),
      onAddCourse: onAddCourse
    }))));
  }
  window.TripLogFeed = TripLogFeed;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/TripLog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/data.js
try { (() => {
// 코스콕 — mock data for the UI kit (한국관광공사 API + TripLog 모사)
window.KK = window.KK || {};
window.KK.regions = ['전체', '서울', '제주', '부산', '강릉', '경주', '여수', '전주'];
window.KK.categories = [{
  key: 'all',
  label: '전체',
  icon: 'compass'
}, {
  key: 'spot',
  label: '관광지',
  icon: 'mountain'
}, {
  key: 'food',
  label: '음식점',
  icon: 'utensils'
}, {
  key: 'stay',
  label: '숙박',
  icon: 'bed-double'
}, {
  key: 'fest',
  label: '축제',
  icon: 'party-popper'
}];
const img = seed => window.__resources && window.__resources['img_' + seed] || `https://picsum.photos/seed/${seed}/800/600`;
window.KK.places = [{
  id: 'p1',
  cat: '관광지',
  title: '성산일출봉',
  region: '제주 서귀포시',
  rating: 4.8,
  reviews: 1204,
  meta: '차로 15분',
  img: img('seongsan'),
  tags: ['일출', '유네스코', '오름'],
  desc: '제주 동쪽 끝, 바다 위로 솟은 분화구. 이른 아침 일출 명소로 사랑받는 곳이에요.'
}, {
  id: 'p2',
  cat: '관광지',
  title: '협재 해변',
  region: '제주 한림읍',
  rating: 4.7,
  reviews: 980,
  meta: '차로 8분',
  img: img('hyeopjae'),
  tags: ['에메랄드빛', '해변', '산책'],
  desc: '비양도를 배경으로 한 에메랄드빛 바다. 가족 단위 여행객에게 인기.'
}, {
  id: 'p3',
  cat: '음식점',
  title: '올레 국수',
  region: '제주 제주시',
  rating: 4.6,
  reviews: 642,
  meta: '도보 3분',
  img: img('noodle'),
  tags: ['고기국수', '현지맛집', '웨이팅'],
  desc: '진한 돼지 육수의 제주식 고기국수. 점심엔 웨이팅이 있어요.'
}, {
  id: 'p4',
  cat: '숙박',
  title: '바다뷰 스테이',
  region: '제주 서귀포시',
  rating: 4.9,
  reviews: 312,
  meta: '체크인 15시',
  img: img('staysea'),
  tags: ['오션뷰', '조식', '감성숙소'],
  desc: '통창 너머로 바다가 펼쳐지는 부티크 스테이. 조식 포함.'
}, {
  id: 'p5',
  cat: '축제',
  title: '제주 들불축제',
  region: '제주 애월읍',
  rating: 4.5,
  reviews: 220,
  meta: '3월',
  img: img('festival'),
  tags: ['봄축제', '야간', '불꽃'],
  desc: '오름에 불을 놓아 한 해의 안녕을 비는 제주의 대표 봄 축제.'
}, {
  id: 'p6',
  cat: '관광지',
  title: '카멜리아 힐',
  region: '제주 안덕면',
  rating: 4.6,
  reviews: 540,
  meta: '차로 20분',
  img: img('camellia'),
  tags: ['수목원', '포토', '동백'],
  desc: '동백과 야생화가 가득한 수목원. 계절마다 다른 풍경.'
}, {
  id: 'p7',
  cat: '음식점',
  title: '해녀의 부엌',
  region: '제주 구좌읍',
  rating: 4.7,
  reviews: 410,
  meta: '예약 필수',
  img: img('haenyeo'),
  tags: ['해산물', '공연', '로컬'],
  desc: '해녀 이야기를 곁들인 다이닝. 예약제로 운영돼요.'
}, {
  id: 'p8',
  cat: '관광지',
  title: '사려니 숲길',
  region: '제주 조천읍',
  rating: 4.8,
  reviews: 720,
  meta: '상시 개방',
  img: img('saryeoni'),
  tags: ['삼나무', '트레킹', '힐링'],
  desc: '삼나무가 늘어선 평탄한 숲길. 산책과 명상에 좋아요.'
}];
window.KK.tripLogs = [{
  id: 't1',
  title: '제주 동쪽만 콕콕 찍은 2박 3일',
  author: '지민',
  avatar: 'jimin',
  region: '제주',
  period: '2박 3일',
  style: '힐링',
  cover: img('jejueast'),
  photos: [img('jejueast'), img('seongsan'), img('saryeoni'), img('hyeopjae')],
  route: ['성산일출봉', '협재 해변', '사려니 숲길', '카멜리아 힐', '해녀의 부엌'],
  rating: 4.8,
  likes: 342,
  saves: 128,
  comments: 24,
  days: 3,
  places: 8,
  date: '3일 전',
  excerpt: '오름과 바다 위주로 천천히 돌았어요. 성산에서 일출 보고 사려니에서 숲멍...'
}, {
  id: 't2',
  title: '부산 미식 여행, 먹으러 갑니다',
  author: '서연',
  avatar: 'seoyeon',
  region: '부산',
  period: '1박 2일',
  style: '미식',
  cover: img('busanfood'),
  photos: [img('busanfood'), img('noodle'), img('haenyeo')],
  route: ['자갈치시장', '밀면집', '돼지국밥', '씨앗호떡'],
  rating: 4.6,
  likes: 210,
  saves: 76,
  comments: 12,
  days: 2,
  places: 6,
  date: '1주 전',
  excerpt: '밀면부터 돼지국밥, 씨앗호떡까지. 칼로리는 잠시 잊기로 했어요.'
}, {
  id: 't3',
  title: '강릉 카페투어 + 바다멍',
  author: '현우',
  avatar: 'hyunwoo',
  region: '강릉',
  period: '당일치기',
  style: '감성',
  cover: img('gangneung'),
  photos: [img('gangneung'), img('camellia'), img('staysea')],
  route: ['안목해변', '커피거리', '경포호'],
  rating: 4.9,
  likes: 156,
  saves: 54,
  comments: 8,
  days: 1,
  places: 5,
  date: '2주 전',
  excerpt: '안목해변 커피거리에서 시작해 경포까지. 파도 소리 BGM 최고.'
}];
window.KK.comments = [{
  id: 'c1',
  author: '하늘',
  avatar: 'haneul',
  text: '성산 일출 진짜 인생샷이죠 😍 저도 담아갈게요!',
  time: '2시간 전',
  likes: 12
}, {
  id: 'c2',
  author: '준',
  avatar: 'jun',
  text: '사려니 숲길 주차 어디에 하셨어요? 참고하고 싶어요',
  time: '5시간 전',
  likes: 3
}, {
  id: 'c3',
  author: '민지',
  avatar: 'minji',
  text: '코스 담아서 다음 주에 똑같이 가보려구요 ㅎㅎ',
  time: '1일 전',
  likes: 8
}];

// AI-generated itinerary (저장 장소 기반) — with 이동수단(move) + 예상 금액(cost)
// move: 직전 장소 → 이 장소 이동 { mode: '차'|'도보'|'버스'|'비행기', time, cost }
// cost: 이 장소에서 드는 1인 예상 비용(입장료/식대/숙박 등)
window.KK.aiPlan = {
  period: '2박 3일',
  style: '힐링',
  days: [{
    day: 1,
    theme: '바다와 일출',
    items: [{
      time: '09:00',
      title: '협재 해변',
      cat: '관광지',
      note: '에메랄드빛 바다 산책',
      img: img('hyeopjae'),
      cost: 0,
      move: {
        mode: '차',
        time: '공항에서 40분',
        cost: 0
      }
    }, {
      time: '12:30',
      title: '올레 국수',
      cat: '음식점',
      note: '점심 — 고기국수',
      img: img('noodle'),
      cost: 9000,
      move: {
        mode: '차',
        time: '25분',
        cost: 0
      }
    }, {
      time: '15:00',
      title: '카멜리아 힐',
      cat: '관광지',
      note: '수목원 포토 타임',
      img: img('camellia'),
      cost: 10000,
      move: {
        mode: '차',
        time: '15분',
        cost: 0
      }
    }, {
      time: '19:00',
      title: '바다뷰 스테이',
      cat: '숙박',
      note: '체크인 · 휴식',
      img: img('staysea'),
      cost: 180000,
      move: {
        mode: '차',
        time: '30분',
        cost: 0
      }
    }]
  }, {
    day: 2,
    theme: '숲과 로컬',
    items: [{
      time: '10:00',
      title: '사려니 숲길',
      cat: '관광지',
      note: '숲멍 트레킹',
      img: img('saryeoni'),
      cost: 0,
      move: {
        mode: '차',
        time: '숙소에서 35분',
        cost: 0
      }
    }, {
      time: '13:00',
      title: '해녀의 부엌',
      cat: '음식점',
      note: '예약 다이닝 + 공연',
      img: img('haenyeo'),
      cost: 65000,
      move: {
        mode: '차',
        time: '20분',
        cost: 0
      }
    }, {
      time: '17:30',
      title: '성산일출봉',
      cat: '관광지',
      note: '노을 무렵 산책',
      img: img('seongsan'),
      cost: 5000,
      move: {
        mode: '차',
        time: '40분',
        cost: 0
      }
    }]
  }, {
    day: 3,
    theme: '마무리',
    items: [{
      time: '06:00',
      title: '성산일출봉',
      cat: '관광지',
      note: '일출 보기',
      img: img('seongsan'),
      cost: 0,
      move: {
        mode: '도보',
        time: '숙소에서 5분',
        cost: 0
      }
    }, {
      time: '09:30',
      title: '제주 들불축제',
      cat: '축제',
      note: '시즌 한정 이벤트',
      img: img('festival'),
      cost: 0,
      move: {
        mode: '차',
        time: '1시간',
        cost: 0
      }
    }]
  }],
  // 렌터카·주유 등 일자 무관 공통 비용
  fixedCost: {
    rental: 90000,
    fuel: 30000
  }
};

// 교통수단 메타 (아이콘 + 라벨)
window.KK.moveModes = {
  '차': {
    icon: 'car',
    label: '자동차'
  },
  '도보': {
    icon: 'walk',
    label: '도보'
  },
  '버스': {
    icon: 'bus',
    label: '대중교통'
  },
  '비행기': {
    icon: 'plane',
    label: '비행기'
  }
};

// 내 여행 — 장소별 기록(추억) 시드. journal[itemKey] = [{id, photos:[dataURL], text, rating, date}]
// 비어 있으면 사용자가 직접 추가(CRUD). 데모용으로 한 개만 시드.
window.KK.journalSeed = {
  '협재 해변': [{
    id: 'j1',
    photos: [],
    text: '오전이라 사람이 적어서 인생샷 건졌어요. 물빛이 진짜 에메랄드 🥹',
    rating: 5,
    date: '여행 1일차'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/data.js", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/icons.js
try { (() => {
// 코스콕 UI kit — inline icon set (Lucide-style: 24×24, stroke currentColor, round).
// Self-contained & React-safe (no DOM replacement). Assigns window.Icon.
(function () {
  const P = {
    compass: '<circle cx="12" cy="12" r="9"/><polygon points="16.2 7.8 13.4 13.4 7.8 16.2 10.6 10.6 16.2 7.8" fill="currentColor" stroke="none"/>',
    mountain: '<path d="M3 19h18L13.5 6l-3 4.5-2-2L3 19z"/>',
    utensils: '<path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3"/><path d="M6 3v18"/><path d="M17 3c-1.5 0-3 1.5-3 5s1.5 4 3 4v9"/>',
    bed: '<path d="M3 8v11"/><path d="M3 13h18a0 0 0 0 1 0 0v6"/><path d="M3 13v-3a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3"/><path d="M21 19v-4a2 2 0 0 0-2-2"/>',
    ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.6"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    heart: '<path d="M20.8 7.6a4.7 4.7 0 0 0-8-2.4l-.8.8-.8-.8a4.7 4.7 0 1 0-6.7 6.7L12 21l7.5-9.1a4.7 4.7 0 0 0 1.3-4.3z"/>',
    sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/><path d="M19 14l.7 1.8L21.5 16.5 19.7 17.2 19 19l-.7-1.8L16.5 16.5 18.3 15.8 19 14z" fill="currentColor" stroke="none"/>',
    wand: '<path d="M15 4V2"/><path d="M15 10V8"/><path d="M12.5 6.5h-2"/><path d="M19.5 6.5h-2"/><path d="M17 4.5 5 16.5 7.5 19l12-12L17 4.5z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 18.5H14a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h5.5"/>',
    message: '<path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-6A8.4 8.4 0 1 1 21 11.5z"/>',
    star: '<path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4L3 5z"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M21 16l-5-5-7 7"/>',
    share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8 15.7 6.4"/><path d="M8.3 13.2 15.7 17.6"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevronR: '<path d="M9 6l6 6-6 6"/>',
    chevronL: '<path d="M15 6l-6 6 6 6"/>',
    chevronD: '<path d="M6 9l6 6 6-6"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    arrowR: '<path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>',
    dots: '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
    grip: '<circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    home: '<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    minus: '<path d="M5 12h14"/>',
    sliders: '<path d="M4 8h10"/><path d="M18 8h2"/><circle cx="16" cy="8" r="2"/><path d="M4 16h2"/><path d="M10 16h10"/><circle cx="8" cy="16" r="2"/>',
    bag: '<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 10 6 10 6a14 14 0 0 1-2.3 2.9"/><path d="M6.6 6.6A14 14 0 0 0 2 12s4 6 10 6a9.5 9.5 0 0 0 4.4-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M3 3l18 18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    car: '<path d="M5 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2"/><path d="M4 16l1.4-5a2 2 0 0 1 1.9-1.4h9.4a2 2 0 0 1 1.9 1.4L21 16H4z"/><circle cx="7.5" cy="16" r="0" /><path d="M6.5 13h11"/>',
    walk: '<circle cx="13" cy="4.5" r="1.6"/><path d="M11 8l2.5-1 2 3 2 1"/><path d="M13.5 7l-1 4 2 2 1 5"/><path d="M12.5 11l-3 2-1 4"/>',
    bus: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16"/><path d="M7 4v7"/><path d="M17 4v7"/><path d="M7 20v-1"/><path d="M17 20v-1"/><circle cx="8" cy="14.5" r="0"/>',
    plane: '<path d="M10.2 4.2a1.4 1.4 0 0 1 2.4 0l1.6 5.1 6 2.4a1 1 0 0 1 0 1.8l-6 2.4-1.6 5.1a1.4 1.4 0 0 1-2.4 0L8.6 16l-3.4-.4a1 1 0 0 1-.6-1.7L7 12 5 9.9a1 1 0 0 1 .6-1.7L9 7.8z"/>',
    camera: '<path d="M4 8a2 2 0 0 1 2-2h1l1.2-1.6A1 1 0 0 1 9 4h6a1 1 0 0 1 .8.4L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0"/><circle cx="9" cy="10" r="0.6" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none"/>',
    arrowUp: '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
    arrowDown: '<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>',
    chevronU: '<path d="M6 15l6-6 6 6"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    plusCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="M8 12h8"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H4"/><circle cx="16" cy="13" r="1.4" fill="currentColor" stroke="none"/>',
    send: '<path d="M4 12l16-7-5 16-3.5-6L4 12z"/><path d="M11.5 15L20 5"/>',
    grip2: '<circle cx="9" cy="7" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="7" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="1.4" fill="currentColor" stroke="none"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none"/>',
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 13l9 5 9-5"/>'
  };
  function Icon({
    name,
    size = 20,
    strokeWidth = 2,
    color = 'currentColor',
    style
  }) {
    return React.createElement('svg', {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: {
        display: 'block',
        flex: 'none',
        ...style
      },
      dangerouslySetInnerHTML: {
        __html: P[name] || ''
      }
    });
  }
  window.Icon = Icon;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/icons.js", error: String((e && e.message) || e) }); }

// ui_kits/courskkok-web/kit.jsx
try { (() => {
// 코스콕 — shared kit helpers (vibe + reusable bits across screens)
(function () {
  const {
    Icon,
    KK
  } = window;
  const DS = window.DesignSystem_3a93b9;
  const {
    Badge
  } = DS;

  // ── money ────────────────────────────────────────────────
  const won = n => (n || 0).toLocaleString('ko-KR') + '원';
  const catColor = {
    '관광지': 'var(--coral-500)',
    '음식점': 'var(--amber-500)',
    '숙박': 'var(--sky-500)',
    '축제': 'var(--mint-500)'
  };
  const catTone = c => c === '음식점' ? 'amber' : c === '숙박' ? 'sky' : c === '축제' ? 'mint' : 'coral';
  const catSoft = {
    '관광지': 'var(--coral-50)',
    '음식점': 'var(--amber-50)',
    '숙박': 'var(--sky-50)',
    '축제': 'var(--mint-50)'
  };

  // ── playful dotted field (decorative) ────────────────────
  function DotField({
    color = 'var(--coral-200)',
    size = 16,
    opacity = 0.5,
    style
  }) {
    return /*#__PURE__*/React.createElement("div", {
      "aria-hidden": true,
      style: {
        position: 'absolute',
        inset: 0,
        opacity,
        backgroundImage: `radial-gradient(${color} 2px, transparent 2px)`,
        backgroundSize: `${size}px ${size}px`,
        ...style
      }
    });
  }

  // ── color band (a soft rounded section background) ───────
  function Band({
    tone = 'coral',
    children,
    style
  }) {
    const map = {
      coral: 'var(--coral-50)',
      sky: 'var(--sky-50)',
      mint: 'var(--mint-50)',
      amber: 'var(--amber-50)',
      cream: '#FFFCFA'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        background: map[tone],
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        ...style
      }
    }, children);
  }

  // ── transport row between two stops ──────────────────────
  function MoveRow({
    move,
    compact
  }) {
    if (!move) return null;
    const meta = KK.moveModes && KK.moveModes[move.mode] || {
      icon: 'car',
      label: move.mode
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: compact ? '2px 0' : '5px 10px',
        borderRadius: 'var(--radius-pill)',
        background: compact ? 'transparent' : 'var(--sky-50)',
        color: 'var(--sky-700)',
        fontSize: 12.5,
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: meta.icon,
      size: 15
    }), /*#__PURE__*/React.createElement("span", null, move.time), move.cost > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--sky-600)'
      }
    }, "\xB7 ", won(move.cost)));
  }

  // ── cost summary card (breakdown by 카테고리 + 교통/고정) ──
  function CostSummary({
    days,
    fixedCost,
    people = 1,
    dense
  }) {
    const sum = {
      '관광지': 0,
      '음식점': 0,
      '숙박': 0,
      '축제': 0,
      move: 0
    };
    days.forEach(d => d.items.forEach(it => {
      sum[it.cat] = (sum[it.cat] || 0) + (it.cost || 0);
      if (it.move) sum.move += it.move.cost || 0;
    }));
    const fixed = fixedCost ? (fixedCost.rental || 0) + (fixedCost.fuel || 0) : 0;
    const perPerson = sum['관광지'] + sum['음식점'] + sum['숙박'] + sum['축제'] + sum.move;
    const total = perPerson * people + fixed;
    const rows = [{
      label: '숙박',
      icon: 'bed',
      v: sum['숙박'],
      color: 'var(--sky-500)'
    }, {
      label: '식비',
      icon: 'utensils',
      v: sum['음식점'],
      color: 'var(--amber-500)'
    }, {
      label: '관광·입장',
      icon: 'ticket',
      v: sum['관광지'] + sum['축제'],
      color: 'var(--coral-500)'
    }, {
      label: '교통·렌터카',
      icon: 'car',
      v: sum.move + fixed,
      color: 'var(--mint-500)'
    }];
    const max = Math.max(...rows.map(r => r.v), 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        padding: dense ? 18 : 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 34,
        height: 34,
        borderRadius: 10,
        background: 'var(--mint-50)',
        color: 'var(--mint-600)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "wallet",
      size: 19
    })), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 16
      }
    }, "\uC608\uC0C1 \uACBD\uBE44"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: 'var(--text-muted)',
        fontWeight: 600
      }
    }, people, "\uC778 \uAE30\uC900")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginBottom: 16
      }
    }, rows.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.label,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        color: r.color,
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: r.icon,
      size: 18
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        width: 84,
        flex: 'none'
      }
    }, r.label), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 7,
        borderRadius: 99,
        background: 'var(--gray-50)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${Math.max(8, r.v / max * 100)}%`,
        height: '100%',
        borderRadius: 99,
        background: r.color
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        width: 86,
        textAlign: 'right',
        flex: 'none'
      }
    }, won(r.v))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        paddingTop: 14,
        borderTop: '1px dashed var(--border)'
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15
      }
    }, "\uCD1D \uD569\uACC4"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 24,
        fontWeight: 800,
        color: 'var(--coral-600)',
        letterSpacing: '-0.02em'
      }
    }, won(total))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--text-muted)',
        marginTop: 6,
        textAlign: 'right'
      }
    }, "1\uC778 ", won(perPerson), " \xB7 \uB80C\uD130\uCE74\xB7\uC8FC\uC720 ", won(fixed), " \uD3EC\uD568"));
  }

  // ── image downscale → dataURL ────────────────────────────
  function fileToThumb(file, maxDim = 1200) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const im = new Image();
        im.onload = () => {
          let {
            width,
            height
          } = im;
          const scale = Math.min(1, maxDim / Math.max(width, height));
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          const c = document.createElement('canvas');
          c.width = width;
          c.height = height;
          c.getContext('2d').drawImage(im, 0, 0, width, height);
          resolve(c.toDataURL('image/jpeg', 0.82));
        };
        im.onerror = () => resolve(reader.result);
        im.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ── photo uploader (file input → thumbs, removable) ──────
  function PhotoUploader({
    photos = [],
    onChange,
    max = 4,
    tileSize = 92,
    addLabel = '사진 추가'
  }) {
    const inputRef = React.useRef(null);
    const [busy, setBusy] = React.useState(false);
    const pick = async e => {
      const files = Array.from(e.target.files || []).slice(0, max - photos.length);
      if (!files.length) return;
      setBusy(true);
      const thumbs = await Promise.all(files.map(f => fileToThumb(f)));
      onChange([...photos, ...thumbs]);
      setBusy(false);
      e.target.value = '';
    };
    const remove = i => onChange(photos.filter((_, idx) => idx !== i));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, photos.map((src, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'relative',
        width: tileSize,
        height: tileSize
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: "",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => remove(i),
      "aria-label": "\uC0AC\uC9C4 \uC0AD\uC81C",
      style: {
        position: 'absolute',
        top: -7,
        right: -7,
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: '2px solid var(--surface)',
        background: 'var(--gray-900)',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 13
    })))), photos.length < max && /*#__PURE__*/React.createElement("button", {
      onClick: () => inputRef.current && inputRef.current.click(),
      disabled: busy,
      style: {
        width: tileSize,
        height: tileSize,
        borderRadius: 'var(--radius-md)',
        cursor: busy ? 'wait' : 'pointer',
        border: '2px dashed var(--coral-200)',
        background: 'var(--coral-50)',
        color: 'var(--coral-600)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: busy ? 'clock' : 'camera',
      size: 22
    }), busy ? '불러오는 중' : addLabel), /*#__PURE__*/React.createElement("input", {
      ref: inputRef,
      type: "file",
      accept: "image/*",
      multiple: true,
      onChange: pick,
      style: {
        display: 'none'
      }
    }));
  }

  // ── tiny rating stars (read-only or editable) ────────────
  function StarPick({
    value = 0,
    onChange,
    size = 22,
    readOnly
  }) {
    const Star = ({
      on
    }) => /*#__PURE__*/React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      style: {
        display: 'block'
      },
      fill: on ? 'var(--star)' : 'var(--gray-200)'
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        gap: 3
      }
    }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
      key: n,
      disabled: readOnly,
      onClick: () => onChange && onChange(n),
      "aria-label": `${n}점`,
      style: {
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: readOnly ? 'default' : 'pointer',
        lineHeight: 0
      }
    }, /*#__PURE__*/React.createElement(Star, {
      on: n <= value
    }))));
  }
  window.Kit = {
    won,
    catColor,
    catTone,
    catSoft,
    DotField,
    Band,
    MoveRow,
    CostSummary,
    PhotoUploader,
    StarPick,
    fileToThumb
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/courskkok-web/kit.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Mascot = __ds_scope.Mascot;

__ds_ns.MascotBubble = __ds_scope.MascotBubble;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.FilterChip = __ds_scope.FilterChip;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.PlaceCard = __ds_scope.PlaceCard;

__ds_ns.Rating = __ds_scope.Rating;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
