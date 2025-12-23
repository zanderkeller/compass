import{j as r}from"./index-CQ0jGMfQ.js";const h=({children:t,onClick:a,className:s="",disabled:o=!1,variant:e="primary",size:i="md"})=>{const l={sm:"px-4 py-2 text-sm",md:"px-8 py-3 text-base",lg:"px-10 py-4 text-lg"},n={primary:"bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50",secondary:"bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50",glass:"bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 hover:border-white/30 shadow-lg hover:shadow-white/20",gradient:"bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/50"};return r.jsxs("button",{onClick:a,disabled:o,className:`
        relative ${l[i]} ${n[e]}
        text-white font-semibold rounded-full overflow-hidden
        transition-all duration-300 transform hover:scale-105 active:scale-95
        ${o?"opacity-50 cursor-not-allowed hover:scale-100":""}
        ${s}
      `,style:{backdropFilter:e==="glass"?"blur(20px) saturate(180%)":"none",WebkitBackdropFilter:e==="glass"?"blur(20px) saturate(180%)":"none"},children:[r.jsx("span",{className:"relative z-10 flex items-center justify-center gap-2",children:t}),e!=="glass"&&r.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"})]})};export{h as N};
//# sourceMappingURL=NeonButton-Cu2Y-Mkf.js.map
