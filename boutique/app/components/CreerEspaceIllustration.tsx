/*
  Illustration isométrique du panneau droit de app/creer-mon-espace/page.tsx :
  entrepôts + camion, reprise telle quelle (mêmes chemins/couleurs, un à un)
  de la maquette creation-compte-entreprise-agreee-lm.html fournie par
  l'utilisateur (bloc svg.scene) — seuls les attributs kebab-case
  (stroke-width...) passent en camelCase pour React, rien d'autre ne
  change. Composant à part car le SVG est volumineux (entrepots, camion,
  ombres) et n'a rien a faire dans CreerEspaceForm.tsx.
*/
export default function CreerEspaceIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 86 900 440"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
            <defs>
              <filter id="flou" x="-50%" y="-200%" width="200%" height="500%">
                <feGaussianBlur stdDeviation="13"/>
              </filter>
            </defs>
            <ellipse cx="40.4" cy="425.0" rx="150.0" ry="15.0" fill="#1A1140" opacity="0.13" filter="url(#flou)"/>
            <ellipse cx="214.5" cy="435.0" rx="160.0" ry="15.0" fill="#1A1140" opacity="0.15" filter="url(#flou)"/>
            <ellipse cx="718.6" cy="439.0" rx="175.0" ry="15.0" fill="#1A1140" opacity="0.13" filter="url(#flou)"/>
            <ellipse cx="460.2" cy="481.0" rx="150.0" ry="15.0" fill="#1A1140" opacity="0.20" filter="url(#flou)"/>
            <path d="M42.0,418.0 L202.0,362.0 L202.0,236.0 L42.0,292.0 Z" fill="#F0B429"/>
            <path d="M42.0,299.0 L52.0,295.5 L52.0,407.5 L42.0,411.0 Z" fill="#D09C23"/>
            <path d="M52.0,295.5 L62.0,292.0 L62.0,404.0 L52.0,407.5 Z" fill="#F1BB3E"/>
            <path d="M62.0,292.0 L72.0,288.5 L72.0,400.5 L62.0,404.0 Z" fill="#D09C23"/>
            <path d="M72.0,288.5 L82.0,285.0 L82.0,397.0 L72.0,400.5 Z" fill="#F1BB3E"/>
            <path d="M82.0,285.0 L92.0,281.5 L92.0,393.5 L82.0,397.0 Z" fill="#D09C23"/>
            <path d="M92.0,281.5 L102.0,278.0 L102.0,390.0 L92.0,393.5 Z" fill="#F1BB3E"/>
            <path d="M102.0,278.0 L112.0,274.5 L112.0,386.5 L102.0,390.0 Z" fill="#D09C23"/>
            <path d="M112.0,274.5 L122.0,271.0 L122.0,383.0 L112.0,386.5 Z" fill="#F1BB3E"/>
            <path d="M122.0,271.0 L132.0,267.5 L132.0,379.5 L122.0,383.0 Z" fill="#D09C23"/>
            <path d="M132.0,267.5 L142.0,264.0 L142.0,376.0 L132.0,379.5 Z" fill="#F1BB3E"/>
            <path d="M142.0,264.0 L152.0,260.5 L152.0,372.5 L142.0,376.0 Z" fill="#D09C23"/>
            <path d="M152.0,260.5 L162.0,257.0 L162.0,369.0 L152.0,372.5 Z" fill="#F1BB3E"/>
            <path d="M162.0,257.0 L172.0,253.5 L172.0,365.5 L162.0,369.0 Z" fill="#D09C23"/>
            <path d="M172.0,253.5 L182.0,250.0 L182.0,362.0 L172.0,365.5 Z" fill="#F1BB3E"/>
            <path d="M182.0,250.0 L192.0,246.5 L192.0,358.5 L182.0,362.0 Z" fill="#D09C23"/>
            <path d="M192.0,246.5 L202.0,243.0 L202.0,355.0 L192.0,358.5 Z" fill="#F1BB3E"/>
            <path d="M42.0,299.0 L42.0,411.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M52.0,295.5 L52.0,407.5" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M62.0,292.0 L62.0,404.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M72.0,288.5 L72.0,400.5" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M82.0,285.0 L82.0,397.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M92.0,281.5 L92.0,393.5" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M102.0,278.0 L102.0,390.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M112.0,274.5 L112.0,386.5" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M122.0,271.0 L122.0,383.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M132.0,267.5 L132.0,379.5" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M142.0,264.0 L142.0,376.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M152.0,260.5 L152.0,372.5" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M162.0,257.0 L162.0,369.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M172.0,253.5 L172.0,365.5" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M182.0,250.0 L182.0,362.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M192.0,246.5 L192.0,358.5" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M202.0,243.0 L202.0,355.0" stroke="#8B6817" strokeWidth=".8" opacity=".45"/>
            <path d="M42.0,292.0 L202.0,236.0 L202.0,243.0 L42.0,299.0 Z" fill="#A87D1C"/>
            <path d="M42.0,411.0 L202.0,355.0 L202.0,362.0 L42.0,418.0 Z" fill="#A87D1C"/>
            <rect x="90.0" y="355.8" width="33.6" height="2.4" fill="#F8DD9E" opacity=".5"/>
            <rect x="90.0" y="343.2" width="33.6" height="2.4" fill="#F8DD9E" opacity=".5"/>
            <rect x="141.2" y="337.9" width="33.6" height="2.4" fill="#F8DD9E" opacity=".5"/>
            <rect x="141.2" y="325.3" width="33.6" height="2.4" fill="#F8DD9E" opacity=".5"/>
            <path d="M-70.0,292.0 L42.0,292.0 L202.0,236.0 L90.0,236.0 Z" fill="#F3C760"/>
            <path d="M-60.0,288.5 L52.0,288.5" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M-50.0,285.0 L62.0,285.0" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M-40.0,281.5 L72.0,281.5" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M-30.0,278.0 L82.0,278.0" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M-20.0,274.5 L92.0,274.5" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M-10.0,271.0 L102.0,271.0" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M0.0,267.5 L112.0,267.5" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M10.0,264.0 L122.0,264.0" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M20.0,260.5 L132.0,260.5" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M30.0,257.0 L142.0,257.0" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M40.0,253.5 L152.0,253.5" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M50.0,250.0 L162.0,250.0" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M60.0,246.5 L172.0,246.5" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M70.0,243.0 L182.0,243.0" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M80.0,239.5 L192.0,239.5" stroke="#8B6817" strokeWidth=".9" opacity=".35"/>
            <path d="M-70.0,292.0 L90.0,236.0" stroke="#F7D994" strokeWidth="1.4" opacity=".55"/>
            <rect x="-70.0" y="292.0" width="112.0" height="126.0" fill="#C09020"/>
            <rect x="-70.0" y="292.0" width="112.0" height="7.0" fill="#9E761B"/>
            <rect x="-70.0" y="411.0" width="112.0" height="7.0" fill="#9E761B"/>
            <rect x="-15.1" y="299.0" width="2.2" height="112.0" fill="#8B6817" opacity=".8"/>
            <path d="M-67.0,334.8 H39.0" stroke="#8B6817" strokeWidth=".9" opacity=".45"/>
            <path d="M-67.0,370.1 H39.0" stroke="#8B6817" strokeWidth=".9" opacity=".45"/>
            <rect x="-56.7" y="299.7" width="3.6" height="110.6" rx="1.6" fill="#D5D6DE"/>
            <rect x="-54.4" y="299.7" width="1.3" height="110.6" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="-58.2" y="352.5" width="6.7" height="13.9" rx="2" fill="#D5D6DE"/>
            <rect x="-59.1" y="302.5" width="8.5" height="3.3" rx="1.4" fill="#9A9BA6"/>
            <rect x="-59.1" y="403.3" width="8.5" height="3.3" rx="1.4" fill="#9A9BA6"/>
            <rect x="-33.2" y="299.7" width="3.6" height="110.6" rx="1.6" fill="#D5D6DE"/>
            <rect x="-30.9" y="299.7" width="1.3" height="110.6" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="-34.7" y="352.5" width="6.7" height="13.9" rx="2" fill="#D5D6DE"/>
            <rect x="-35.6" y="302.5" width="8.5" height="3.3" rx="1.4" fill="#9A9BA6"/>
            <rect x="-35.6" y="403.3" width="8.5" height="3.3" rx="1.4" fill="#9A9BA6"/>
            <rect x="1.6" y="299.7" width="3.6" height="110.6" rx="1.6" fill="#D5D6DE"/>
            <rect x="3.8" y="299.7" width="1.3" height="110.6" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="-0.0" y="352.5" width="6.7" height="13.9" rx="2" fill="#D5D6DE"/>
            <rect x="-0.9" y="302.5" width="8.5" height="3.3" rx="1.4" fill="#9A9BA6"/>
            <rect x="-0.9" y="403.3" width="8.5" height="3.3" rx="1.4" fill="#9A9BA6"/>
            <rect x="25.1" y="299.7" width="3.6" height="110.6" rx="1.6" fill="#D5D6DE"/>
            <rect x="27.3" y="299.7" width="1.3" height="110.6" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="23.5" y="352.5" width="6.7" height="13.9" rx="2" fill="#D5D6DE"/>
            <rect x="22.6" y="302.5" width="8.5" height="3.3" rx="1.4" fill="#9A9BA6"/>
            <rect x="22.6" y="403.3" width="8.5" height="3.3" rx="1.4" fill="#9A9BA6"/>
            <rect x="-67.5" y="309.6" width="3.4" height="6.9" rx="1.4" fill="#9A9BA6"/>
            <rect x="36.2" y="309.6" width="3.4" height="6.9" rx="1.4" fill="#9A9BA6"/>
            <rect x="-67.5" y="355.0" width="3.4" height="6.9" rx="1.4" fill="#9A9BA6"/>
            <rect x="36.2" y="355.0" width="3.4" height="6.9" rx="1.4" fill="#9A9BA6"/>
            <rect x="-67.5" y="400.4" width="3.4" height="6.9" rx="1.4" fill="#9A9BA6"/>
            <rect x="36.2" y="400.4" width="3.4" height="6.9" rx="1.4" fill="#9A9BA6"/>
            <rect x="-70.0" y="292.0" width="12.9" height="7.8" rx="1.8" fill="#6B5012"/>
            <rect x="29.1" y="292.0" width="12.9" height="7.8" rx="1.8" fill="#6B5012"/>
            <rect x="-70.0" y="410.2" width="12.9" height="7.8" rx="1.8" fill="#6B5012"/>
            <rect x="29.1" y="410.2" width="12.9" height="7.8" rx="1.8" fill="#6B5012"/>
            <path d="M186.5,236.0 L202.0,236.0 L202.0,243.8 L186.5,243.8 Z" fill="#5B440F"/>
            <path d="M186.5,354.2 L202.0,354.2 L202.0,362.0 L186.5,362.0 Z" fill="#5B440F"/>
            <path d="M216.0,428.0 L388.0,368.0 L388.0,234.0 L216.0,294.0 Z" fill="#7FC3DC"/>
            <path d="M216.0,301.4 L225.6,298.0 L225.6,417.3 L216.0,420.6 Z" fill="#6EA9BF"/>
            <path d="M225.6,298.0 L235.1,294.7 L235.1,414.0 L225.6,417.3 Z" fill="#8BC9DF"/>
            <path d="M235.1,294.7 L244.7,291.4 L244.7,410.6 L235.1,414.0 Z" fill="#6EA9BF"/>
            <path d="M244.7,291.4 L254.2,288.0 L254.2,407.3 L244.7,410.6 Z" fill="#8BC9DF"/>
            <path d="M254.2,288.0 L263.8,284.7 L263.8,404.0 L254.2,407.3 Z" fill="#6EA9BF"/>
            <path d="M263.8,284.7 L273.3,281.4 L273.3,400.6 L263.8,404.0 Z" fill="#8BC9DF"/>
            <path d="M273.3,281.4 L282.9,278.0 L282.9,397.3 L273.3,400.6 Z" fill="#6EA9BF"/>
            <path d="M282.9,278.0 L292.4,274.7 L292.4,394.0 L282.9,397.3 Z" fill="#8BC9DF"/>
            <path d="M292.4,274.7 L302.0,271.4 L302.0,390.6 L292.4,394.0 Z" fill="#6EA9BF"/>
            <path d="M302.0,271.4 L311.6,268.0 L311.6,387.3 L302.0,390.6 Z" fill="#8BC9DF"/>
            <path d="M311.6,268.0 L321.1,264.7 L321.1,384.0 L311.6,387.3 Z" fill="#6EA9BF"/>
            <path d="M321.1,264.7 L330.7,261.4 L330.7,380.6 L321.1,384.0 Z" fill="#8BC9DF"/>
            <path d="M330.7,261.4 L340.2,258.0 L340.2,377.3 L330.7,380.6 Z" fill="#6EA9BF"/>
            <path d="M340.2,258.0 L349.8,254.7 L349.8,374.0 L340.2,377.3 Z" fill="#8BC9DF"/>
            <path d="M349.8,254.7 L359.3,251.4 L359.3,370.6 L349.8,374.0 Z" fill="#6EA9BF"/>
            <path d="M359.3,251.4 L368.9,248.0 L368.9,367.3 L359.3,370.6 Z" fill="#8BC9DF"/>
            <path d="M368.9,248.0 L378.4,244.7 L378.4,364.0 L368.9,367.3 Z" fill="#6EA9BF"/>
            <path d="M378.4,244.7 L388.0,241.4 L388.0,360.6 L378.4,364.0 Z" fill="#8BC9DF"/>
            <path d="M216.0,301.4 L216.0,420.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M225.6,298.0 L225.6,417.3" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M235.1,294.7 L235.1,414.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M244.7,291.4 L244.7,410.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M254.2,288.0 L254.2,407.3" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M263.8,284.7 L263.8,404.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M273.3,281.4 L273.3,400.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M282.9,278.0 L282.9,397.3" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M292.4,274.7 L292.4,394.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M302.0,271.4 L302.0,390.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M311.6,268.0 L311.6,387.3" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M321.1,264.7 L321.1,384.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M330.7,261.4 L330.7,380.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M340.2,258.0 L340.2,377.3" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M349.8,254.7 L349.8,374.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M359.3,251.4 L359.3,370.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M368.9,248.0 L368.9,367.3" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M378.4,244.7 L378.4,364.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M388.0,241.4 L388.0,360.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M216.0,294.0 L388.0,234.0 L388.0,241.4 L216.0,301.4 Z" fill="#58889A"/>
            <path d="M216.0,420.6 L388.0,360.6 L388.0,368.0 L216.0,428.0 Z" fill="#58889A"/>
            <rect x="267.6" y="361.8" width="36.0" height="2.4" fill="#C5E4EF" opacity=".5"/>
            <rect x="267.6" y="348.4" width="36.0" height="2.4" fill="#C5E4EF" opacity=".5"/>
            <rect x="322.6" y="342.6" width="36.0" height="2.4" fill="#C5E4EF" opacity=".5"/>
            <rect x="322.6" y="329.2" width="36.0" height="2.4" fill="#C5E4EF" opacity=".5"/>
            <path d="M96.0,294.0 L216.0,294.0 L388.0,234.0 L268.0,234.0 Z" fill="#A0D2E5"/>
            <path d="M105.6,290.7 L225.6,290.7" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M115.1,287.3 L235.1,287.3" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M124.7,284.0 L244.7,284.0" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M134.2,280.7 L254.2,280.7" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M143.8,277.3 L263.8,277.3" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M153.3,274.0 L273.3,274.0" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M162.9,270.7 L282.9,270.7" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M172.4,267.3 L292.4,267.3" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M182.0,264.0 L302.0,264.0" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M191.6,260.7 L311.6,260.7" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M201.1,257.3 L321.1,257.3" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M210.7,254.0 L330.7,254.0" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M220.2,250.7 L340.2,250.7" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M229.8,247.3 L349.8,247.3" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M239.3,244.0 L359.3,244.0" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M248.9,240.7 L368.9,240.7" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M258.4,237.3 L378.4,237.3" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M96.0,294.0 L268.0,234.0" stroke="#BFE1ED" strokeWidth="1.4" opacity=".55"/>
            <rect x="96.0" y="294.0" width="120.0" height="134.0" fill="#659CB0"/>
            <rect x="96.0" y="294.0" width="120.0" height="7.4" fill="#538091"/>
            <rect x="96.0" y="420.6" width="120.0" height="7.4" fill="#538091"/>
            <rect x="154.9" y="301.4" width="2.2" height="119.3" fill="#49717F" opacity=".8"/>
            <path d="M99.0,339.6 H213.0" stroke="#49717F" strokeWidth=".9" opacity=".45"/>
            <path d="M99.0,377.1 H213.0" stroke="#49717F" strokeWidth=".9" opacity=".45"/>
            <rect x="110.3" y="302.1" width="3.8" height="117.8" rx="1.6" fill="#D5D6DE"/>
            <rect x="112.7" y="302.1" width="1.4" height="117.8" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="108.6" y="358.3" width="7.2" height="14.7" rx="2" fill="#D5D6DE"/>
            <rect x="107.6" y="305.1" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="107.6" y="412.5" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="135.5" y="302.1" width="3.8" height="117.8" rx="1.6" fill="#D5D6DE"/>
            <rect x="137.9" y="302.1" width="1.4" height="117.8" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="133.8" y="358.3" width="7.2" height="14.7" rx="2" fill="#D5D6DE"/>
            <rect x="132.8" y="305.1" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="132.8" y="412.5" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="172.7" y="302.1" width="3.8" height="117.8" rx="1.6" fill="#D5D6DE"/>
            <rect x="175.1" y="302.1" width="1.4" height="117.8" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="171.0" y="358.3" width="7.2" height="14.7" rx="2" fill="#D5D6DE"/>
            <rect x="170.0" y="305.1" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="170.0" y="412.5" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="197.9" y="302.1" width="3.8" height="117.8" rx="1.6" fill="#D5D6DE"/>
            <rect x="200.3" y="302.1" width="1.4" height="117.8" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="196.2" y="358.3" width="7.2" height="14.7" rx="2" fill="#D5D6DE"/>
            <rect x="195.2" y="305.1" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="195.2" y="412.5" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="98.6" y="312.8" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="209.8" y="312.8" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="98.6" y="361.0" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="209.8" y="361.0" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="98.6" y="409.2" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="209.8" y="409.2" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="96.0" y="294.0" width="13.8" height="8.3" rx="1.8" fill="#395762"/>
            <rect x="202.2" y="294.0" width="13.8" height="8.3" rx="1.8" fill="#395762"/>
            <rect x="96.0" y="419.7" width="13.8" height="8.3" rx="1.8" fill="#395762"/>
            <rect x="202.2" y="419.7" width="13.8" height="8.3" rx="1.8" fill="#395762"/>
            <path d="M371.4,234.0 L388.0,234.0 L388.0,242.3 L371.4,242.3 Z" fill="#304A53"/>
            <path d="M371.4,359.7 L388.0,359.7 L388.0,368.0 L371.4,368.0 Z" fill="#304A53"/>
            <path d="M216.0,294.0 L388.0,234.0 L388.0,100.0 L216.0,160.0 Z" fill="#3E7CB1"/>
            <path d="M216.0,167.4 L225.6,164.0 L225.6,283.3 L216.0,286.6 Z" fill="#356B99"/>
            <path d="M225.6,164.0 L235.1,160.7 L235.1,280.0 L225.6,283.3 Z" fill="#5189B8"/>
            <path d="M235.1,160.7 L244.7,157.4 L244.7,276.6 L235.1,280.0 Z" fill="#356B99"/>
            <path d="M244.7,157.4 L254.2,154.0 L254.2,273.3 L244.7,276.6 Z" fill="#5189B8"/>
            <path d="M254.2,154.0 L263.8,150.7 L263.8,270.0 L254.2,273.3 Z" fill="#356B99"/>
            <path d="M263.8,150.7 L273.3,147.4 L273.3,266.6 L263.8,270.0 Z" fill="#5189B8"/>
            <path d="M273.3,147.4 L282.9,144.0 L282.9,263.3 L273.3,266.6 Z" fill="#356B99"/>
            <path d="M282.9,144.0 L292.4,140.7 L292.4,260.0 L282.9,263.3 Z" fill="#5189B8"/>
            <path d="M292.4,140.7 L302.0,137.4 L302.0,256.6 L292.4,260.0 Z" fill="#356B99"/>
            <path d="M302.0,137.4 L311.6,134.0 L311.6,253.3 L302.0,256.6 Z" fill="#5189B8"/>
            <path d="M311.6,134.0 L321.1,130.7 L321.1,250.0 L311.6,253.3 Z" fill="#356B99"/>
            <path d="M321.1,130.7 L330.7,127.4 L330.7,246.6 L321.1,250.0 Z" fill="#5189B8"/>
            <path d="M330.7,127.4 L340.2,124.0 L340.2,243.3 L330.7,246.6 Z" fill="#356B99"/>
            <path d="M340.2,124.0 L349.8,120.7 L349.8,240.0 L340.2,243.3 Z" fill="#5189B8"/>
            <path d="M349.8,120.7 L359.3,117.4 L359.3,236.6 L349.8,240.0 Z" fill="#356B99"/>
            <path d="M359.3,117.4 L368.9,114.0 L368.9,233.3 L359.3,236.6 Z" fill="#5189B8"/>
            <path d="M368.9,114.0 L378.4,110.7 L378.4,230.0 L368.9,233.3 Z" fill="#356B99"/>
            <path d="M378.4,110.7 L388.0,107.4 L388.0,226.6 L378.4,230.0 Z" fill="#5189B8"/>
            <path d="M216.0,167.4 L216.0,286.6" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M225.6,164.0 L225.6,283.3" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M235.1,160.7 L235.1,280.0" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M244.7,157.4 L244.7,276.6" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M254.2,154.0 L254.2,273.3" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M263.8,150.7 L263.8,270.0" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M273.3,147.4 L273.3,266.6" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M282.9,144.0 L282.9,263.3" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M292.4,140.7 L292.4,260.0" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M302.0,137.4 L302.0,256.6" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M311.6,134.0 L311.6,253.3" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M321.1,130.7 L321.1,250.0" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M330.7,127.4 L330.7,246.6" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M340.2,124.0 L340.2,243.3" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M349.8,120.7 L349.8,240.0" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M359.3,117.4 L359.3,236.6" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M368.9,114.0 L368.9,233.3" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M378.4,110.7 L378.4,230.0" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M388.0,107.4 L388.0,226.6" stroke="#234766" strokeWidth=".8" opacity=".45"/>
            <path d="M216.0,160.0 L388.0,100.0 L388.0,107.4 L216.0,167.4 Z" fill="#2B567B"/>
            <path d="M216.0,286.6 L388.0,226.6 L388.0,234.0 L216.0,294.0 Z" fill="#2B567B"/>
            <rect x="267.6" y="227.8" width="36.0" height="2.4" fill="#A8C4DB" opacity=".5"/>
            <rect x="267.6" y="214.4" width="36.0" height="2.4" fill="#A8C4DB" opacity=".5"/>
            <rect x="322.6" y="208.6" width="36.0" height="2.4" fill="#A8C4DB" opacity=".5"/>
            <rect x="322.6" y="195.2" width="36.0" height="2.4" fill="#A8C4DB" opacity=".5"/>
            <path d="M96.0,160.0 L216.0,160.0 L388.0,100.0 L268.0,100.0 Z" fill="#709EC5"/>
            <path d="M105.6,156.7 L225.6,156.7" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M115.1,153.3 L235.1,153.3" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M124.7,150.0 L244.7,150.0" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M134.2,146.7 L254.2,146.7" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M143.8,143.3 L263.8,143.3" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M153.3,140.0 L273.3,140.0" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M162.9,136.7 L282.9,136.7" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M172.4,133.3 L292.4,133.3" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M182.0,130.0 L302.0,130.0" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M191.6,126.7 L311.6,126.7" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M201.1,123.3 L321.1,123.3" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M210.7,120.0 L330.7,120.0" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M220.2,116.7 L340.2,116.7" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M229.8,113.3 L349.8,113.3" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M239.3,110.0 L359.3,110.0" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M248.9,106.7 L368.9,106.7" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M258.4,103.3 L378.4,103.3" stroke="#234766" strokeWidth=".9" opacity=".35"/>
            <path d="M96.0,160.0 L268.0,100.0" stroke="#9EBDD8" strokeWidth="1.4" opacity=".55"/>
            <rect x="96.0" y="160.0" width="120.0" height="134.0" fill="#31638D"/>
            <rect x="96.0" y="160.0" width="120.0" height="7.4" fill="#285174"/>
            <rect x="96.0" y="286.6" width="120.0" height="7.4" fill="#285174"/>
            <rect x="154.9" y="167.4" width="2.2" height="119.3" fill="#234766" opacity=".8"/>
            <path d="M99.0,205.6 H213.0" stroke="#234766" strokeWidth=".9" opacity=".45"/>
            <path d="M99.0,243.1 H213.0" stroke="#234766" strokeWidth=".9" opacity=".45"/>
            <rect x="110.3" y="168.1" width="3.8" height="117.8" rx="1.6" fill="#D5D6DE"/>
            <rect x="112.7" y="168.1" width="1.4" height="117.8" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="108.6" y="224.3" width="7.2" height="14.7" rx="2" fill="#D5D6DE"/>
            <rect x="107.6" y="171.1" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="107.6" y="278.5" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="135.5" y="168.1" width="3.8" height="117.8" rx="1.6" fill="#D5D6DE"/>
            <rect x="137.9" y="168.1" width="1.4" height="117.8" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="133.8" y="224.3" width="7.2" height="14.7" rx="2" fill="#D5D6DE"/>
            <rect x="132.8" y="171.1" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="132.8" y="278.5" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="172.7" y="168.1" width="3.8" height="117.8" rx="1.6" fill="#D5D6DE"/>
            <rect x="175.1" y="168.1" width="1.4" height="117.8" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="171.0" y="224.3" width="7.2" height="14.7" rx="2" fill="#D5D6DE"/>
            <rect x="170.0" y="171.1" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="170.0" y="278.5" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="197.9" y="168.1" width="3.8" height="117.8" rx="1.6" fill="#D5D6DE"/>
            <rect x="200.3" y="168.1" width="1.4" height="117.8" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="196.2" y="224.3" width="7.2" height="14.7" rx="2" fill="#D5D6DE"/>
            <rect x="195.2" y="171.1" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="195.2" y="278.5" width="9.1" height="3.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="98.6" y="178.8" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="209.8" y="178.8" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="98.6" y="227.0" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="209.8" y="227.0" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="98.6" y="275.2" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="209.8" y="275.2" width="3.6" height="7.4" rx="1.4" fill="#9A9BA6"/>
            <rect x="96.0" y="160.0" width="13.8" height="8.3" rx="1.8" fill="#1B374F"/>
            <rect x="202.2" y="160.0" width="13.8" height="8.3" rx="1.8" fill="#1B374F"/>
            <rect x="96.0" y="285.7" width="13.8" height="8.3" rx="1.8" fill="#1B374F"/>
            <rect x="202.2" y="285.7" width="13.8" height="8.3" rx="1.8" fill="#1B374F"/>
            <path d="M371.4,100.0 L388.0,100.0 L388.0,108.3 L371.4,108.3 Z" fill="#172F43"/>
            <path d="M371.4,225.7 L388.0,225.7 L388.0,234.0 L371.4,234.0 Z" fill="#172F43"/>
            <path d="M714.0,432.0 L910.0,364.0 L910.0,226.0 L714.0,294.0 Z" fill="#7FC3DC"/>
            <path d="M714.0,301.6 L723.8,298.2 L723.8,421.0 L714.0,424.4 Z" fill="#6EA9BF"/>
            <path d="M723.8,298.2 L733.6,294.8 L733.6,417.6 L723.8,421.0 Z" fill="#8BC9DF"/>
            <path d="M733.6,294.8 L743.4,291.4 L743.4,414.2 L733.6,417.6 Z" fill="#6EA9BF"/>
            <path d="M743.4,291.4 L753.2,288.0 L753.2,410.8 L743.4,414.2 Z" fill="#8BC9DF"/>
            <path d="M753.2,288.0 L763.0,284.6 L763.0,407.4 L753.2,410.8 Z" fill="#6EA9BF"/>
            <path d="M763.0,284.6 L772.8,281.2 L772.8,404.0 L763.0,407.4 Z" fill="#8BC9DF"/>
            <path d="M772.8,281.2 L782.6,277.8 L782.6,400.6 L772.8,404.0 Z" fill="#6EA9BF"/>
            <path d="M782.6,277.8 L792.4,274.4 L792.4,397.2 L782.6,400.6 Z" fill="#8BC9DF"/>
            <path d="M792.4,274.4 L802.2,271.0 L802.2,393.8 L792.4,397.2 Z" fill="#6EA9BF"/>
            <path d="M802.2,271.0 L812.0,267.6 L812.0,390.4 L802.2,393.8 Z" fill="#8BC9DF"/>
            <path d="M812.0,267.6 L821.8,264.2 L821.8,387.0 L812.0,390.4 Z" fill="#6EA9BF"/>
            <path d="M821.8,264.2 L831.6,260.8 L831.6,383.6 L821.8,387.0 Z" fill="#8BC9DF"/>
            <path d="M831.6,260.8 L841.4,257.4 L841.4,380.2 L831.6,383.6 Z" fill="#6EA9BF"/>
            <path d="M841.4,257.4 L851.2,254.0 L851.2,376.8 L841.4,380.2 Z" fill="#8BC9DF"/>
            <path d="M851.2,254.0 L861.0,250.6 L861.0,373.4 L851.2,376.8 Z" fill="#6EA9BF"/>
            <path d="M861.0,250.6 L870.8,247.2 L870.8,370.0 L861.0,373.4 Z" fill="#8BC9DF"/>
            <path d="M870.8,247.2 L880.6,243.8 L880.6,366.6 L870.8,370.0 Z" fill="#6EA9BF"/>
            <path d="M880.6,243.8 L890.4,240.4 L890.4,363.2 L880.6,366.6 Z" fill="#8BC9DF"/>
            <path d="M890.4,240.4 L900.2,237.0 L900.2,359.8 L890.4,363.2 Z" fill="#6EA9BF"/>
            <path d="M900.2,237.0 L910.0,233.6 L910.0,356.4 L900.2,359.8 Z" fill="#8BC9DF"/>
            <path d="M714.0,301.6 L714.0,424.4" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M723.8,298.2 L723.8,421.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M733.6,294.8 L733.6,417.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M743.4,291.4 L743.4,414.2" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M753.2,288.0 L753.2,410.8" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M763.0,284.6 L763.0,407.4" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M772.8,281.2 L772.8,404.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M782.6,277.8 L782.6,400.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M792.4,274.4 L792.4,397.2" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M802.2,271.0 L802.2,393.8" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M812.0,267.6 L812.0,390.4" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M821.8,264.2 L821.8,387.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M831.6,260.8 L831.6,383.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M841.4,257.4 L841.4,380.2" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M851.2,254.0 L851.2,376.8" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M861.0,250.6 L861.0,373.4" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M870.8,247.2 L870.8,370.0" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M880.6,243.8 L880.6,366.6" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M890.4,240.4 L890.4,363.2" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M900.2,237.0 L900.2,359.8" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M910.0,233.6 L910.0,356.4" stroke="#49717F" strokeWidth=".8" opacity=".45"/>
            <path d="M714.0,294.0 L910.0,226.0 L910.0,233.6 L714.0,301.6 Z" fill="#58889A"/>
            <path d="M714.0,424.4 L910.0,356.4 L910.0,364.0 L714.0,432.0 Z" fill="#58889A"/>
            <rect x="772.8" y="361.9" width="37.2" height="2.4" fill="#C5E4EF" opacity=".5"/>
            <rect x="772.8" y="348.1" width="37.2" height="2.4" fill="#C5E4EF" opacity=".5"/>
            <rect x="835.5" y="340.2" width="37.2" height="2.4" fill="#C5E4EF" opacity=".5"/>
            <rect x="835.5" y="326.4" width="37.2" height="2.4" fill="#C5E4EF" opacity=".5"/>
            <path d="M590.0,294.0 L714.0,294.0 L910.0,226.0 L786.0,226.0 Z" fill="#A0D2E5"/>
            <path d="M599.8,290.6 L723.8,290.6" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M609.6,287.2 L733.6,287.2" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M619.4,283.8 L743.4,283.8" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M629.2,280.4 L753.2,280.4" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M639.0,277.0 L763.0,277.0" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M648.8,273.6 L772.8,273.6" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M658.6,270.2 L782.6,270.2" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M668.4,266.8 L792.4,266.8" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M678.2,263.4 L802.2,263.4" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M688.0,260.0 L812.0,260.0" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M697.8,256.6 L821.8,256.6" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M707.6,253.2 L831.6,253.2" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M717.4,249.8 L841.4,249.8" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M727.2,246.4 L851.2,246.4" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M737.0,243.0 L861.0,243.0" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M746.8,239.6 L870.8,239.6" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M756.6,236.2 L880.6,236.2" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M766.4,232.8 L890.4,232.8" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M776.2,229.4 L900.2,229.4" stroke="#49717F" strokeWidth=".9" opacity=".35"/>
            <path d="M590.0,294.0 L786.0,226.0" stroke="#BFE1ED" strokeWidth="1.4" opacity=".55"/>
            <rect x="590.0" y="294.0" width="124.0" height="138.0" fill="#659CB0"/>
            <rect x="590.0" y="294.0" width="124.0" height="7.6" fill="#538091"/>
            <rect x="590.0" y="424.4" width="124.0" height="7.6" fill="#538091"/>
            <rect x="650.9" y="301.6" width="2.2" height="122.8" fill="#49717F" opacity=".8"/>
            <path d="M593.0,340.9 H711.0" stroke="#49717F" strokeWidth=".9" opacity=".45"/>
            <path d="M593.0,379.6 H711.0" stroke="#49717F" strokeWidth=".9" opacity=".45"/>
            <rect x="604.8" y="302.3" width="4.0" height="121.3" rx="1.6" fill="#D5D6DE"/>
            <rect x="607.2" y="302.3" width="1.5" height="121.3" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="603.0" y="360.2" width="7.4" height="15.2" rx="2" fill="#D5D6DE"/>
            <rect x="602.0" y="305.4" width="9.4" height="3.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="602.0" y="416.1" width="9.4" height="3.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="630.8" y="302.3" width="4.0" height="121.3" rx="1.6" fill="#D5D6DE"/>
            <rect x="633.3" y="302.3" width="1.5" height="121.3" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="629.1" y="360.2" width="7.4" height="15.2" rx="2" fill="#D5D6DE"/>
            <rect x="628.1" y="305.4" width="9.4" height="3.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="628.1" y="416.1" width="9.4" height="3.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="669.2" y="302.3" width="4.0" height="121.3" rx="1.6" fill="#D5D6DE"/>
            <rect x="671.7" y="302.3" width="1.5" height="121.3" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="667.5" y="360.2" width="7.4" height="15.2" rx="2" fill="#D5D6DE"/>
            <rect x="666.5" y="305.4" width="9.4" height="3.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="666.5" y="416.1" width="9.4" height="3.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="695.3" y="302.3" width="4.0" height="121.3" rx="1.6" fill="#D5D6DE"/>
            <rect x="697.8" y="302.3" width="1.5" height="121.3" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="693.5" y="360.2" width="7.4" height="15.2" rx="2" fill="#D5D6DE"/>
            <rect x="692.5" y="305.4" width="9.4" height="3.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="692.5" y="416.1" width="9.4" height="3.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="592.7" y="313.3" width="3.7" height="7.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="707.6" y="313.3" width="3.7" height="7.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="592.7" y="363.0" width="3.7" height="7.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="707.6" y="363.0" width="3.7" height="7.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="592.7" y="412.7" width="3.7" height="7.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="707.6" y="412.7" width="3.7" height="7.6" rx="1.4" fill="#9A9BA6"/>
            <rect x="590.0" y="294.0" width="14.3" height="8.6" rx="1.8" fill="#395762"/>
            <rect x="699.7" y="294.0" width="14.3" height="8.6" rx="1.8" fill="#395762"/>
            <rect x="590.0" y="423.4" width="14.3" height="8.6" rx="1.8" fill="#395762"/>
            <rect x="699.7" y="423.4" width="14.3" height="8.6" rx="1.8" fill="#395762"/>
            <path d="M892.9,226.0 L910.0,226.0 L910.0,234.6 L892.9,234.6 Z" fill="#304A53"/>
            <path d="M892.9,355.4 L910.0,355.4 L910.0,364.0 L892.9,364.0 Z" fill="#304A53"/>
            <path d="M548.0,474.0 L578.0,463.0 L578.0,251.0 L548.0,262.0 Z" fill="#D2453C"/>
            <path d="M548.0,273.7 L555.5,270.9 L555.5,459.6 L548.0,462.3 Z" fill="#B63C34"/>
            <path d="M555.5,270.9 L563.0,268.2 L563.0,456.8 L555.5,459.6 Z" fill="#D6574F"/>
            <path d="M563.0,268.2 L570.5,265.4 L570.5,454.1 L563.0,456.8 Z" fill="#B63C34"/>
            <path d="M570.5,265.4 L578.0,262.7 L578.0,451.3 L570.5,454.1 Z" fill="#D6574F"/>
            <path d="M548.0,273.7 L548.0,462.3" stroke="#792822" strokeWidth=".8" opacity=".45"/>
            <path d="M555.5,270.9 L555.5,459.6" stroke="#792822" strokeWidth=".8" opacity=".45"/>
            <path d="M563.0,268.2 L563.0,456.8" stroke="#792822" strokeWidth=".8" opacity=".45"/>
            <path d="M570.5,265.4 L570.5,454.1" stroke="#792822" strokeWidth=".8" opacity=".45"/>
            <path d="M578.0,262.7 L578.0,451.3" stroke="#792822" strokeWidth=".8" opacity=".45"/>
            <path d="M548.0,262.0 L578.0,251.0 L578.0,262.7 L548.0,273.7 Z" fill="#93302A"/>
            <path d="M548.0,462.3 L578.0,451.3 L578.0,463.0 L548.0,474.0 Z" fill="#93302A"/>
            <rect x="557.0" y="394.4" width="58.8" height="2.4" fill="#EAABA7" opacity=".5"/>
            <rect x="557.0" y="373.2" width="58.8" height="2.4" fill="#EAABA7" opacity=".5"/>
            <rect x="566.6" y="390.9" width="58.8" height="2.4" fill="#EAABA7" opacity=".5"/>
            <rect x="566.6" y="369.7" width="58.8" height="2.4" fill="#EAABA7" opacity=".5"/>
            <path d="M352.0,262.0 L548.0,262.0 L578.0,251.0 L382.0,251.0 Z" fill="#DD756E"/>
            <path d="M359.5,259.2 L555.5,259.2" stroke="#792822" strokeWidth=".9" opacity=".35"/>
            <path d="M367.0,256.5 L563.0,256.5" stroke="#792822" strokeWidth=".9" opacity=".35"/>
            <path d="M374.5,253.8 L570.5,253.8" stroke="#792822" strokeWidth=".9" opacity=".35"/>
            <path d="M352.0,262.0 L382.0,251.0" stroke="#E8A29D" strokeWidth="1.4" opacity=".55"/>
            <rect x="352.0" y="262.0" width="196.0" height="212.0" fill="#A83730"/>
            <rect x="352.0" y="262.0" width="196.0" height="11.7" fill="#8A2D27"/>
            <rect x="352.0" y="462.3" width="196.0" height="11.7" fill="#8A2D27"/>
            <rect x="448.9" y="273.7" width="2.2" height="188.7" fill="#792822" opacity=".8"/>
            <path d="M355.0,334.1 H545.0" stroke="#792822" strokeWidth=".9" opacity=".45"/>
            <path d="M355.0,393.4 H545.0" stroke="#792822" strokeWidth=".9" opacity=".45"/>
            <rect x="375.3" y="274.8" width="6.3" height="186.3" rx="1.6" fill="#D5D6DE"/>
            <rect x="379.2" y="274.8" width="2.4" height="186.3" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="372.6" y="363.8" width="11.8" height="23.3" rx="2" fill="#D5D6DE"/>
            <rect x="371.0" y="279.5" width="14.9" height="5.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="371.0" y="449.5" width="14.9" height="5.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="416.5" y="274.8" width="6.3" height="186.3" rx="1.6" fill="#D5D6DE"/>
            <rect x="420.4" y="274.8" width="2.4" height="186.3" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="413.7" y="363.8" width="11.8" height="23.3" rx="2" fill="#D5D6DE"/>
            <rect x="412.2" y="279.5" width="14.9" height="5.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="412.2" y="449.5" width="14.9" height="5.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="477.2" y="274.8" width="6.3" height="186.3" rx="1.6" fill="#D5D6DE"/>
            <rect x="481.2" y="274.8" width="2.4" height="186.3" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="474.5" y="363.8" width="11.8" height="23.3" rx="2" fill="#D5D6DE"/>
            <rect x="472.9" y="279.5" width="14.9" height="5.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="472.9" y="449.5" width="14.9" height="5.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="518.4" y="274.8" width="6.3" height="186.3" rx="1.6" fill="#D5D6DE"/>
            <rect x="522.3" y="274.8" width="2.4" height="186.3" rx="1.6" fill="#9A9BA6" opacity=".55"/>
            <rect x="515.7" y="363.8" width="11.8" height="23.3" rx="2" fill="#D5D6DE"/>
            <rect x="514.1" y="279.5" width="14.9" height="5.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="514.1" y="449.5" width="14.9" height="5.5" rx="1.4" fill="#9A9BA6"/>
            <rect x="356.3" y="291.7" width="5.9" height="11.7" rx="1.4" fill="#9A9BA6"/>
            <rect x="537.8" y="291.7" width="5.9" height="11.7" rx="1.4" fill="#9A9BA6"/>
            <rect x="356.3" y="368.0" width="5.9" height="11.7" rx="1.4" fill="#9A9BA6"/>
            <rect x="537.8" y="368.0" width="5.9" height="11.7" rx="1.4" fill="#9A9BA6"/>
            <rect x="356.3" y="444.3" width="5.9" height="11.7" rx="1.4" fill="#9A9BA6"/>
            <rect x="537.8" y="444.3" width="5.9" height="11.7" rx="1.4" fill="#9A9BA6"/>
            <rect x="352.0" y="262.0" width="22.5" height="13.1" rx="1.8" fill="#5E1F1A"/>
            <rect x="525.5" y="262.0" width="22.5" height="13.1" rx="1.8" fill="#5E1F1A"/>
            <rect x="352.0" y="460.9" width="22.5" height="13.1" rx="1.8" fill="#5E1F1A"/>
            <rect x="525.5" y="460.9" width="22.5" height="13.1" rx="1.8" fill="#5E1F1A"/>
            <path d="M551.0,251.0 L578.0,251.0 L578.0,264.1 L551.0,264.1 Z" fill="#4F1A16"/>
            <path d="M551.0,449.9 L578.0,449.9 L578.0,463.0 L551.0,463.0 Z" fill="#4F1A16"/>
    </svg>
  );
}
