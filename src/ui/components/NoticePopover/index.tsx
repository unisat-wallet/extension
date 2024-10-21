// export const NoticePopover = ({ onClose }: { onClose: (mode: 'opnet-only' | 'opnet-with-standards') => void }) => {
//     const [opNetOnly, setOpNetOnly] = useState(true);
//     const [coolDown, setCoolDown] = useState(3);
//     const [enable, setEnable] = useState(false);

//     useEffect(() => {
//         if (coolDown > 0) {
//             const timer = setTimeout(() => {
//                 setCoolDown((prev) => prev - 1);
//             }, 1000);
//             return () => clearTimeout(timer);
//         } else {
//             setEnable(true);
//         }
//     }, [coolDown]);

//     return (
//         <Popover>
//             <Column justifyCenter itemsCenter>
//                 <Text text="Setup Preferences" preset="title-bold" />
//                 <Icon
//                     icon={'settings'}
//                     color={'icon_yellow'}
//                     size={35}
//                     style={{
//                         marginBottom: 12
//                     }}
//                 />

//                 <Column
//                     gap="zero"
//                     style={{
//                         marginBottom: 20
//                     }}>
//                     <Text text={'Choose your setup:'} preset={'bold'} />
//                     <div style={{ marginTop: 8 }}>
//                         <Checkbox checked={opNetOnly} onChange={(e) => setOpNetOnly(true)}>
//                             <div style={{ fontSize: fontSizes.sm }}>
//                                 Use <span style={{ color: '#EBB94C' }}>OP_NET only</span>, without support for other
//                                 standards such as Ordinals, Atomicals or Runes.
//                             </div>
//                         </Checkbox>
//                     </div>
//                     <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

//                     <div>
//                         <Checkbox checked={!opNetOnly} onChange={(e) => setOpNetOnly(false)}>
//                             <div style={{ fontSize: fontSizes.sm }}>
//                                 Enable support for additional standards (e.g.,{' '}
//                                 <span style={{ color: '#EBB94C' }}>Ordinals, Atomicals, Runes</span>) along with OP_NET.
//                             </div>
//                         </Checkbox>
//                     </div>
//                 </Column>

//                 <Text
//                     text="You can change this setting later in the preferences if needed."
//                     preset="default"
//                     style={{ marginBottom: 12, textAlign: 'center' }}
//                 />

//                 <Row full>
//                     <Button
//                         text={coolDown > 0 ? `OK (${coolDown}s)` : 'OK'}
//                         preset="primary"
//                         disabled={!enable}
//                         full
//                         onClick={() => {
//                             if (!enable) return;
//                             if (onClose) {
//                                 onClose(opNetOnly ? 'opnet-only' : 'opnet-with-standards');
//                             }
//                         }}
//                     />
//                 </Row>
//             </Column>
//         </Popover>
//     );
// };
