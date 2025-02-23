import { Group, Input, NumberInput, SegmentedControl, Stack } from "@mantine/core";
import { FormArmorLayer, useBallisticSimulatorFormContext } from "./ballistic-simulator-form-context";

export interface TargetUIProps {
    w?: number | string
    fullWidth?: boolean
}

export type TargetZone = 'Head' | 'Thorax' | 'Stomach' | 'Arm';

const defaultHead: FormArmorLayer = {
    id: "",
    isPlate: false,
    armorClass: 3,
    durability: 18,
    maxDurability: 18,
    armorMaterial: "Steel",
    bluntDamageThroughput: 17.26,
}

const defaultThoraxStomach: FormArmorLayer = {
    id: "",
    isPlate: false,
    armorClass: 4,
    durability: 44,
    maxDurability: 44,
    armorMaterial: "Ceramic",
    bluntDamageThroughput: 28,
}
const defaultArm: FormArmorLayer = {
    id: "",
    isPlate: false,
    armorClass: 3,
    durability: 30,
    maxDurability: 30,
    armorMaterial: "Aramid",
    bluntDamageThroughput: 36,
}

export function TargetUiAlternate(props: TargetUIProps) {
    const form = useBallisticSimulatorFormContext();

    function TargetZoneToMaxLayers(value: TargetZone) {
        switch (value) {
            case 'Head':
                return 3;
            case 'Thorax':
                return 2;
            case 'Stomach':
                return 2;
            case 'Arm':
                return 1;
            default:
                throw new Error('Invalid Target Zone');
        }
    }

    function TargetZoneToHp(value: TargetZone) {
        switch (value) {
            case 'Head':
                return 35;
            case 'Thorax':
                return 85;
            case 'Stomach':
                return 70;
            case 'Arm':
                return 60;
            default:
                throw new Error('Invalid Target Zone');
        }
    }

    function armorLayerDefault(value: TargetZone) {
        switch (value) {
            case 'Head':
                return defaultHead;
            case 'Thorax':
                return defaultThoraxStomach;
            case 'Stomach':
                return defaultThoraxStomach;
            case 'Arm':
                return defaultArm;
            default:
                throw new Error('Invalid Target Zone');
        }
    }
    return (
        <Stack spacing={2} mt={1} mb={5}>
            <Input.Label>
                Target Zone
            </Input.Label>
            <SegmentedControl
                size="sm"
                fullWidth={props.fullWidth}
                data={[
                    { label: 'Head', value: 'Head' },
                    { label: 'Thorax', value: 'Thorax' },
                    { label: 'Stomach', value: 'Stomach' },
                    { label: 'Arm', value: 'Arm' },
                    // { label: 'Legs', value: 'Legs' },  // todo: need to expand FE to include total HP pool input. Thought: add "Target Info" which defaults to PMC but allows for input of individual zones and thus, changing the total.
                ]}
                {...form.getInputProps("targetZone")}
                onChange={(value => {
                    const zone = value as TargetZone;
                    form.setFieldValue("targetZone", zone);
                    form.setFieldValue("hitPointsPool", TargetZoneToHp(zone))
                    const newLayers = armorLayerDefault(zone);
                    form.setFieldValue("armorLayers", [newLayers])
                    form.setFieldValue("maxLayers", TargetZoneToMaxLayers(zone))
                })}
            />
            <Group>
                <Input.Description>
                    Hit points:
                </Input.Description>
                <NumberInput 
                    size="xs" 
                    w={80}
                    precision={0}
                    max={999}
                    min={1}
                    step={1}
                    stepHoldDelay={200}
                    stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                    {...form.getInputProps("hitPointsPool")} />
            </Group>


        </Stack>

    )
}