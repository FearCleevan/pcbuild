import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { allComponents, componentCategories, getComponentsByType, preBuiltSeriesList, type ComponentItem } from '../../data/mockData';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme';

type BuildView = 'overview' | 'builder';
type BuildType = 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case' | 'cooler';
type BuildMap = Partial<Record<BuildType, ComponentItem>>;
type FilterState = { query: string; maxPrice: string; maker: string; stockOnly: boolean; unique: Record<string, string[]> };
type SavedBuild = { id: string; name: string; total: number; watts: number };

const SLOTS: BuildType[] = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooler'];
const UNIQUE_FILTERS: Record<BuildType, string[]> = {
  cpu: ['Socket', 'Core Count', 'Manufacturer'],
  motherboard: ['Socket', 'Chipset', 'Memory Type', 'Form Factor'],
  ram: ['Memory Type', 'Capacity', 'Speed'],
  gpu: ['Manufacturer', 'VRAM', 'Series', 'Interface'],
  storage: ['Type', 'Capacity', 'Interface'],
  psu: ['Wattage', 'Efficiency Rating', 'Manufacturer'],
  case: ['Motherboard Support', 'Type', 'Color'],
  cooler: ['Type', 'Socket Compatibility', 'Radiator Size'],
};
const EMPTY_FILTER: FilterState = { query: '', maxPrice: '', maker: 'All', stockOnly: true, unique: {} };
const slotName = (slot: BuildType) => componentCategories.find((x) => x.id === slot)?.name ?? slot.toUpperCase();
const price = (n: number) => `PHP ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const spec = (item: ComponentItem | undefined, key: string) => {
  const v = item?.specs?.[key];
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
};
const num = (v: unknown) => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return 0;
  const m = v.match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
};

const estimateWatts = (build: BuildMap) => SLOTS.reduce((sum, slot) => {
  const item = build[slot];
  if (!item) return sum;
  const tdp = num(item.specs.TDP);
  if (slot === 'motherboard') return sum + (tdp || 45);
  if (slot === 'ram') return sum + (tdp || 10);
  if (slot === 'storage') return sum + (tdp || 8);
  if (slot === 'cooler') return sum + (tdp || 10);
  return sum + tdp;
}, 0);

const warningsForBuild = (build: BuildMap, watts: number) => {
  const out: string[] = [];
  const cpuSocket = spec(build.cpu, 'Socket');
  const mbSocket = spec(build.motherboard, 'Socket');
  const mbMem = spec(build.motherboard, 'Memory Type');
  const ramMem = spec(build.ram, 'Memory Type');
  const coolerCompat = spec(build.cooler, 'Socket Compatibility');
  const mbForm = spec(build.motherboard, 'Form Factor');
  const caseSupport = spec(build.case, 'Motherboard Support');
  const gpuLen = num(build.gpu?.specs['Card Length']);
  const caseMax = num(build.case?.specs['Max GPU Length']);
  const psuW = num(build.psu?.specs.Wattage);
  const recPsu = Math.ceil((watts * 1.25) / 50) * 50;
  if (cpuSocket && mbSocket && cpuSocket !== mbSocket) out.push(`CPU (${cpuSocket}) and motherboard (${mbSocket}) socket mismatch.`);
  if (mbMem && ramMem && mbMem !== ramMem) out.push(`RAM type ${ramMem} mismatches motherboard ${mbMem}.`);
  if (cpuSocket && coolerCompat && !coolerCompat.toLowerCase().includes(cpuSocket.toLowerCase())) out.push(`Cooler may not support ${cpuSocket}.`);
  if (mbForm && caseSupport && !caseSupport.toLowerCase().includes(mbForm.toLowerCase())) out.push(`Case support (${caseSupport}) may not fit ${mbForm}.`);
  if (gpuLen > 0 && caseMax > 0 && gpuLen > caseMax) out.push(`GPU length ${gpuLen}mm exceeds case limit ${caseMax}mm.`);
  if (psuW > 0 && psuW < recPsu) out.push(`PSU ${psuW}W is low. Recommended at least ${recPsu}W.`);
  return out;
};

export default function BuildScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<BuildView>('overview');
  const [buildName, setBuildName] = useState('');
  const [build, setBuild] = useState<BuildMap>({});
  const [saved, setSaved] = useState<SavedBuild[]>([]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [slot, setSlot] = useState<BuildType>('cpu');
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<ComponentItem | null>(null);
  const [detailSlot, setDetailSlot] = useState<BuildType>('cpu');

  const watts = useMemo(() => estimateWatts(build), [build]);
  const total = useMemo(() => Object.values(build).reduce((s, i) => s + (i?.price ?? 0), 0), [build]);
  const recPsu = useMemo(() => Math.ceil((watts * 1.25) / 50) * 50, [watts]);
  const warnings = useMemo(() => warningsForBuild(build, watts), [build, watts]);
  const products = useMemo(() => getComponentsByType(slot), [slot]);
  const makers = useMemo(() => ['All', ...Array.from(new Set(products.map((x) => spec(x, 'Manufacturer')).filter(Boolean))).sort()], [products]);
  const uniqueOptions = useMemo(() => {
    const out: Record<string, string[]> = {};
    UNIQUE_FILTERS[slot].forEach((key) => {
      out[key] = Array.from(new Set(products.map((x) => spec(x, key)).filter(Boolean))).sort();
    });
    return out;
  }, [products, slot]);
  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    const max = num(filter.maxPrice);
    return products.filter((x) => {
      if (filter.stockOnly && x.stockCount <= 0) return false;
      if (max > 0 && x.price > max) return false;
      if (filter.maker !== 'All' && spec(x, 'Manufacturer') !== filter.maker) return false;
      for (const key of UNIQUE_FILTERS[slot]) {
        const selected = filter.unique[key] ?? [];
        if (selected.length && !selected.includes(spec(x, key))) return false;
      }
      if (!q) return true;
      return [x.name, x.type, ...Object.values(x.specs).map(String)].join(' ').toLowerCase().includes(q);
    });
  }, [filter, products, slot]);

  const saveBuild = () => {
    const name = buildName.trim() || `My Build ${saved.length + 1}`;
    setSaved((prev) => [{ id: String(Date.now()), name, total, watts }, ...prev]);
    setBuildName(name);
    Alert.alert('Build Saved', `${name} was saved for this session.`);
  };
  const openPicker = (nextSlot: BuildType) => { setSlot(nextSlot); setFilter(EMPTY_FILTER); setPickerVisible(true); };
  const removeSelected = (nextSlot: BuildType) => setBuild((prev) => { const next = { ...prev }; delete next[nextSlot]; return next; });
  const selectForSlot = (nextSlot: BuildType, item: ComponentItem) => { setBuild((prev) => ({ ...prev, [nextSlot]: item })); setPickerVisible(false); setDetailVisible(false); };

  if (view === 'overview') {
    return (
      <SafeAreaView edges={['top']} style={st.safe}>
        <ScrollView style={st.scroll} contentContainerStyle={st.content}>
          <View style={st.top}>
            <View style={st.brand}><View style={st.logo}><MaterialCommunityIcons name='cpu-64-bit' size={20} color={COLORS.text.primary} /></View><View><Text style={st.brandT}>Custom PC Build</Text><Text style={st.brandS}>Build. Compare. Upgrade.</Text></View></View>
            <Pressable style={st.icon} onPress={() => Alert.alert('Cart', 'Cart route is ready.')}><MaterialCommunityIcons name='cart-outline' size={20} color={COLORS.text.primary} /></Pressable>
          </View>
          <View style={st.card}>
            <Text style={st.title}>Build Your PC</Text>
            <Text style={st.sub}>Use table slots and drawer-based component selection with full product detail.</Text>
            <Pressable style={st.primary} onPress={() => setView('builder')}><Text style={st.primaryT}>Build Now</Text></Pressable>
          </View>
          <Text style={st.section}>Prebuild PCs</Text>
          {preBuiltSeriesList.map((x) => (
            <View key={x.id} style={st.card}>
              <Text style={st.title}>{x.name}</Text><Text style={st.sub}>{x.subtitle}</Text><Text style={st.price}>Estimated {price(x.estimatedPrice)}</Text>
              <View style={st.buttons}>
                <Pressable style={st.outline} onPress={() => Alert.alert('Prebuild Details', `${x.name} detail route is ready.`)}><Text style={st.outlineT}>View Full Build</Text></Pressable>
                <Pressable style={st.primarySmall} onPress={() => setView('builder')}><Text style={st.primarySmallT}>Customize</Text></Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={st.safe}>
      <ScrollView style={st.scroll} contentContainerStyle={st.content}>
        <View style={st.topRow}><Pressable style={st.icon} onPress={() => setView('overview')}><MaterialCommunityIcons name='arrow-left' size={20} color={COLORS.text.primary} /></Pressable><Text style={st.brandT}>Build Configurator</Text><Pressable style={st.icon}><MaterialCommunityIcons name='cart-outline' size={20} color={COLORS.text.primary} /></Pressable></View>
        <View style={st.card}><Text style={st.title}>Build Name</Text><TextInput value={buildName} onChangeText={setBuildName} placeholder='Enter build name' placeholderTextColor={COLORS.text.tertiary} style={st.input} /></View>
        <View style={st.card}>
          <Text style={st.title}>Component Slots</Text>
          <View style={st.tableHead}><Text style={[st.tableHeadText, st.colType]}>Component</Text><Text style={[st.tableHeadText, st.colSelected]}>Selected Product</Text><Text style={[st.tableHeadText, st.colAction]}>Actions</Text></View>
          {SLOTS.map((x) => {
            const selected = build[x];
            return (
              <View key={x} style={st.tableRow}>
                <View style={st.colType}><Text style={st.tableType}>{slotName(x)}</Text></View>
                <View style={st.colSelected}>
                  {selected ? (
                    <View style={st.selectedWrap}>
                      <Image source={{ uri: selected.image }} style={st.selectedImg} />
                      <View style={{ flex: 1 }}><Text numberOfLines={1} style={st.value}>{selected.name}</Text><Text style={st.price}>{price(selected.price)}</Text></View>
                      <Pressable style={st.removeBtn} onPress={() => removeSelected(x)}><MaterialCommunityIcons name='trash-can-outline' size={16} color={COLORS.danger} /></Pressable>
                    </View>
                  ) : <Text style={st.meta}>No component selected</Text>}
                </View>
                <View style={st.colAction}><Pressable style={st.actionBtn} onPress={() => openPicker(x)}><MaterialCommunityIcons name={selected ? 'reload' : 'plus'} size={16} color={COLORS.text.primary} /><Text style={st.actionBtnText}>{selected ? 'Reselect' : 'Add'}</Text></Pressable></View>
              </View>
            );
          })}
        </View>
        <View style={st.card}>
          <Text style={st.title}>Compatibility and Power</Text>
          <View style={st.kv}><Text style={st.meta}>Total Price</Text><Text style={st.value}>{price(total)}</Text></View>
          <View style={st.kv}><Text style={st.meta}>Estimated Wattage</Text><Text style={st.value}>{watts}W</Text></View>
          <View style={st.kv}><Text style={st.meta}>Recommended PSU</Text><Text style={st.value}>{recPsu}W</Text></View>
          <View style={st.kv}><Text style={st.meta}>Selected PSU</Text><Text style={st.value}>{num(build.psu?.specs.Wattage) || 0}W</Text></View>
          {warnings.length ? warnings.map((w) => <Text key={w} style={st.warn}>{w}</Text>) : <Text style={st.ok}>No compatibility warnings detected.</Text>}
          <Pressable style={st.primary} onPress={saveBuild}><Text style={st.primaryT}>Save Build</Text></Pressable>
        </View>
        {!!saved.length && <View style={st.card}>{saved.map((x) => <View key={x.id} style={st.kv}><Text style={st.value}>{x.name}</Text><Text style={st.meta}>{price(x.total)} • {x.watts}W</Text></View>)}</View>}
      </ScrollView>

      <Modal visible={pickerVisible} transparent animationType='slide' onRequestClose={() => setPickerVisible(false)}>
        <View style={st.bo}>
          <Pressable style={st.bb} onPress={() => setPickerVisible(false)} />
          <View style={[st.bsht, { paddingBottom: insets.bottom + SPACING.md }]}>
            <View style={st.sh}><Text style={st.sht}>Select {slotName(slot)}</Text><Pressable onPress={() => setPickerVisible(false)}><MaterialCommunityIcons name='close' size={22} color={COLORS.text.primary} /></Pressable></View>
            <ScrollView contentContainerStyle={st.filterWrap}>
              <TextInput value={filter.query} onChangeText={(v) => setFilter((p) => ({ ...p, query: v }))} placeholder='Search name/specs' placeholderTextColor={COLORS.text.tertiary} style={st.input} />
              <TextInput value={filter.maxPrice} onChangeText={(v) => setFilter((p) => ({ ...p, maxPrice: v.replace(/[^0-9]/g, '') }))} placeholder='Max price' keyboardType='numeric' placeholderTextColor={COLORS.text.tertiary} style={st.input} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chips}>{makers.map((m) => <Pressable key={m} style={[st.chip, filter.maker === m && st.chipA]} onPress={() => setFilter((p) => ({ ...p, maker: m }))}><Text style={[st.chipT, filter.maker === m && st.chipTA]}>{m}</Text></Pressable>)}</ScrollView>
              {UNIQUE_FILTERS[slot].map((key) => uniqueOptions[key]?.length ? <View key={key}><Text style={st.filterTitle}>{key}</Text><View style={st.fWrap}>{uniqueOptions[key].map((v) => { const a = (filter.unique[key] ?? []).includes(v); return <Pressable key={`${key}-${v}`} style={[st.fChip, a && st.fChipA]} onPress={() => setFilter((p) => ({ ...p, unique: { ...p.unique, [key]: a ? (p.unique[key] ?? []).filter((x) => x !== v) : [...(p.unique[key] ?? []), v] } }))}><Text style={[st.fChipT, a && st.fChipTA]}>{v}</Text></Pressable>; })}</View></View> : null)}
              <View style={st.switchR}><Text style={st.meta}>In stock only</Text><Switch value={filter.stockOnly} onValueChange={(v) => setFilter((p) => ({ ...p, stockOnly: v }))} trackColor={{ false: COLORS.borderLight, true: COLORS.primaryLight }} thumbColor={COLORS.white} /></View>
            </ScrollView>
            <FlatList
              data={filtered}
              keyExtractor={(x) => x.id}
              numColumns={2}
              columnWrapperStyle={st.gr}
              contentContainerStyle={st.g}
              renderItem={({ item }) => (
                <View style={st.pCard}>
                  <Image source={{ uri: item.image }} style={st.pImg} />
                  <Text numberOfLines={2} style={st.pName}>{item.name}</Text>
                  <Text style={st.pType}>{item.type.toUpperCase()}</Text>
                  <View style={st.pMeta}><Text style={st.pPrice}>{price(item.price)}</Text><Text style={st.meta}>{item.stockCount} left</Text></View>
                  <View style={st.act}>
                    <Pressable style={st.viewBtn} onPress={() => { setDetailSlot(slot); setDetailItem(item); setPickerVisible(false); setDetailVisible(true); }}><MaterialCommunityIcons name='eye-outline' size={16} color={COLORS.text.primary} /><Text style={st.viewBtnT}>View</Text></Pressable>
                    <Pressable style={st.selectBtn} onPress={() => selectForSlot(slot, item)}><MaterialCommunityIcons name='check-circle-outline' size={16} color={COLORS.text.primary} /><Text style={st.selectBtnT}>Select</Text></Pressable>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={st.meta}>No products match current filters.</Text>}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={detailVisible} transparent animationType='slide' onRequestClose={() => setDetailVisible(false)}>
        <View style={st.bo}>
          <Pressable style={st.bb} onPress={() => setDetailVisible(false)} />
          <View style={[st.bsht, { paddingBottom: insets.bottom + SPACING.md }]}>
            <View style={st.sh}><Text style={st.sht}>Product Details</Text><Pressable onPress={() => setDetailVisible(false)}><MaterialCommunityIcons name='close' size={22} color={COLORS.text.primary} /></Pressable></View>
            {detailItem ? <ScrollView contentContainerStyle={st.sc}><Image source={{ uri: detailItem.image }} style={st.di} /><Text style={st.title}>{detailItem.name}</Text><Text style={st.price}>{price(detailItem.price)}</Text><View style={st.cardFlat}>{Object.entries(detailItem.specs).map(([k, v]) => <View key={k} style={st.rowSpec}><Text style={st.meta}>{k}</Text><Text style={st.value}>{String(v)}</Text></View>)}</View><Pressable style={st.primary} onPress={() => selectForSlot(detailSlot, detailItem)}><Text style={st.primaryT}>Use Component for {slotName(detailSlot)}</Text></Pressable></ScrollView> : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING['3xl'], gap: SPACING.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logo: { width: 38, height: 38, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.primary },
  brandT: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.lg, fontWeight: TYPOGRAPHY.fontWeights.bold },
  brandS: { color: COLORS.text.tertiary, fontSize: TYPOGRAPHY.fontSizes.sm },
  icon: { width: 38, height: 38, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  section: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.xl, fontWeight: TYPOGRAPHY.fontWeights.bold },
  card: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm, ...SHADOWS.md },
  cardFlat: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, gap: SPACING.xs },
  title: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.lg, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  sub: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.fontSizes.sm, lineHeight: 20 },
  label: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.fontSizes.sm },
  value: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.sm, fontWeight: TYPOGRAPHY.fontWeights.semibold, flex: 1 },
  meta: { color: COLORS.text.tertiary, fontSize: TYPOGRAPHY.fontSizes.xs },
  price: { color: COLORS.primaryLight, fontSize: TYPOGRAPHY.fontSizes.sm, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  warn: { color: COLORS.warning, fontSize: TYPOGRAPHY.fontSizes.sm },
  ok: { color: COLORS.success, fontSize: TYPOGRAPHY.fontSizes.sm },
  kv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  rowSpec: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surfaceLight, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, color: COLORS.text.primary },
  buttons: { flexDirection: 'row', gap: SPACING.sm },
  outline: { flex: 1, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceLight },
  outlineT: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.sm, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  primary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, borderWidth: 1, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center', ...SHADOWS.primary },
  primaryT: { color: COLORS.white, fontSize: TYPOGRAPHY.fontSizes.md, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  primarySmall: { flex: 1, backgroundColor: COLORS.primary, borderColor: COLORS.primary, borderWidth: 1, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  primarySmallT: { color: COLORS.white, fontSize: TYPOGRAPHY.fontSizes.sm, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  tableHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.xs },
  tableHeadText: { color: COLORS.text.tertiary, fontSize: TYPOGRAPHY.fontSizes.xs, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.sm, gap: SPACING.xs },
  colType: { flex: 0.9 }, colSelected: { flex: 2 }, colAction: { flex: 0.9 },
  tableType: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.fontSizes.sm },
  selectedWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  selectedImg: { width: 42, height: 42, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.surfaceLight },
  removeBtn: { padding: 6 },
  actionBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingVertical: 6, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: COLORS.surfaceLight },
  actionBtnText: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.xs, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  bo: { flex: 1, justifyContent: 'flex-end' },
  bb: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  bsht: { maxHeight: '92%', backgroundColor: COLORS.background, borderTopLeftRadius: BORDER_RADIUS['2xl'], borderTopRightRadius: BORDER_RADIUS['2xl'], borderWidth: 1, borderColor: COLORS.border, borderBottomWidth: 0, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  sh: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sht: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.xl, fontWeight: TYPOGRAPHY.fontWeights.bold },
  sc: { gap: SPACING.md, paddingBottom: SPACING.lg },
  di: { width: '100%', height: 190, borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.surfaceLight },
  filterWrap: { gap: SPACING.sm, paddingBottom: SPACING.md },
  filterTitle: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.sm, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  switchR: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { gap: SPACING.xs, paddingRight: SPACING.sm },
  chip: { borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.borderLight, backgroundColor: COLORS.surfaceLight, paddingHorizontal: SPACING.md, paddingVertical: 6 },
  chipA: { borderColor: COLORS.primaryLight, backgroundColor: COLORS.primary + '20' },
  chipT: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.fontSizes.sm },
  chipTA: { color: COLORS.primaryLight, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  fWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  fChip: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  fChipA: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fChipT: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.fontSizes.xs },
  fChipTA: { color: COLORS.white },
  g: { paddingBottom: SPACING.lg },
  gr: { justifyContent: 'space-between', marginBottom: SPACING.sm },
  pCard: { width: '48.5%', backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm },
  pImg: { width: '100%', height: 110, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm, backgroundColor: COLORS.surfaceLight },
  pName: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.sm, fontWeight: TYPOGRAPHY.fontWeights.semibold, minHeight: 36 },
  pType: { color: COLORS.primaryLight, fontSize: TYPOGRAPHY.fontSizes.xs, fontWeight: TYPOGRAPHY.fontWeights.bold, marginTop: 2, marginBottom: SPACING.xs },
  pMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  pPrice: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.fontSizes.sm, fontWeight: TYPOGRAPHY.fontWeights.bold },
  act: { flexDirection: 'row', gap: SPACING.xs, alignItems: 'stretch' },
  viewBtn: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceLight, paddingVertical: SPACING.xs + 2, paddingHorizontal: 5 },
  selectBtn: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.primary, paddingVertical: SPACING.xs + 2, paddingHorizontal: 5 },
  viewBtnT: { color: COLORS.text.primary, fontSize: 10, fontWeight: TYPOGRAPHY.fontWeights.semibold, flexShrink: 1, textAlign: 'center' },
  selectBtnT: { color: COLORS.white, fontSize: 10, fontWeight: TYPOGRAPHY.fontWeights.semibold, flexShrink: 1, textAlign: 'center' },
});

