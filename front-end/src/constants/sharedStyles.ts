import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';

const { width } = Dimensions.get('window');

/**
 * Shared / reusable styles used across multiple screens.
 * Import with:  import { shared, SPACING } from '../../constants/sharedStyles';
 */

// ── Design tokens ──────────────────────────────────────────────────────
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

export const RADIUS = {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    xxl: 14,
    pill: 20,
    round: 18,
    full: 9999,
};

export const FONT = {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    xxl: 17,
    title: 20,
    heading: 22,
};

export const SEMANTIC_COLORS = {
    success: '#10B981',
    successBg: '#D1FAE5',
    successLightBg: '#F0FDF4',
    successBorder: '#BBF7D0',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    star: '#F59E0B',
    dark: '#1B3A4B',
    lightBlue: '#F0F9FF',
    activeTabBg: '#E0F2FE',
    mapBg: '#E5F0E5',
    overlay: 'rgba(0,0,0,0.25)',
    overlayLight: 'rgba(255,255,255,0.9)',
    overlayWhiteHalf: 'rgba(255,255,255,0.5)',
    overlayWhiteTint: 'rgba(255,255,255,0.2)',
    textShadow: 'rgba(0,0,0,0.5)',
};

// ── Reusable style objects ─────────────────────────────────────────────
export const shared = StyleSheet.create({
    /* ─── Layout ─── */
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    flexCenter: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spacer: {
        flex: 1,
    },

    /* ─── Search bar (used in Home + Map) ─── */
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray100,
        borderRadius: RADIUS.xl,
        paddingHorizontal: SPACING.md,
        height: 44,
        marginRight: 10,
    },
    searchIcon: {
        fontSize: FONT.xl,
        marginRight: SPACING.sm,
        color: colors.gray400,
    },
    searchInput: {
        flex: 1,
        fontSize: FONT.lg,
        color: colors.gray800,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.xl,
        backgroundColor: SEMANTIC_COLORS.dark,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* ─── Filter chips (used in Home + Map) ─── */
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.pill,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        marginRight: SPACING.sm,
    },
    chipActive: {
        backgroundColor: SEMANTIC_COLORS.dark,
        borderColor: SEMANTIC_COLORS.dark,
    },
    chipText: {
        fontSize: FONT.md,
        color: colors.gray600,
        fontWeight: '500',
    },
    chipTextActive: {
        color: colors.white,
    },

    /* ─── Section header (used in Home + Map + PlaceDetails) ─── */
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT.xxl,
        fontWeight: '700',
        color: colors.gray900,
    },
    seeAll: {
        fontSize: FONT.base,
        color: colors.primary,
        fontWeight: '500',
    },

    /* ─── Circular icon buttons (back, bookmark) ─── */
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.round,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    /* ─── Small pill-shaped CTA (+ Report) ─── */
    reportBtnSmall: {
        backgroundColor: colors.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
    },
    reportBtnSmallText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: FONT.md,
    },

    /* ─── Primary full-width CTA button ─── */
    primaryBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: FONT.lg,
    },

    /* ─── Outline full-width CTA button ─── */
    outlineBtn: {
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
    },
    outlineBtnText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: FONT.base,
    },

    /* ─── Status badge (Accessible / Partially / Not) ─── */
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.sm,
    },
    statusText: {
        fontSize: FONT.sm,
        fontWeight: '600',
    },

    /* ─── Map placeholder ─── */
    mapPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SEMANTIC_COLORS.mapBg,
    },

    /* ─── Emoji icon text (used for inline icons) ─── */
    iconEmoji: {
        fontSize: FONT.xl,
        color: colors.gray400,
    },
    iconEmojiSm: {
        fontSize: FONT.sm,
        marginRight: SPACING.xs,
    },
    iconEmojiLg: {
        fontSize: 22,
        marginRight: SPACING.sm,
    },

    /* ─── Photo grid (used in PlaceDetails + PublicDetails + ReportDetails) ─── */
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    photoThumb: {
        width: (width - 40) / 2,
        height: 100,
        borderRadius: RADIUS.lg,
    },

    /* ─── Accessibility feature card ─── */
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    featureCard: {
        width: (width - 42) / 2,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: RADIUS.xl,
    },
    featureLabel: {
        fontSize: FONT.base,
        fontWeight: '600',
        color: colors.gray900,
    },
    featureSublabel: {
        fontSize: FONT.sm,
        color: colors.gray600,
    },

    /* ─── Drag handle (bottom sheets / panels) ─── */
    handleRow: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray300,
    },

    /* ─── Bottom spacer ─── */
    bottomSpacer: {
        height: 30,
    },
});
