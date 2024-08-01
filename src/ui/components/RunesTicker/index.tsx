import { Text } from '../Text';

const $tickerPresets: { sm: { textSize: any }; md: { textSize: any }; lg: { textSize: any } } = {
    sm: {
        textSize: 'xs'
    },
    md: {
        textSize: 'sm'
    },
    lg: {
        textSize: 'md'
    }
};

type Presets = keyof typeof $tickerPresets;

export function RunesTicker({ tick, preset }: { tick: string | undefined; preset?: Presets }) {
    const style = $tickerPresets[preset || 'md'];
    return <Text text={tick} size={style.textSize} color="gold" wrap />;
}
