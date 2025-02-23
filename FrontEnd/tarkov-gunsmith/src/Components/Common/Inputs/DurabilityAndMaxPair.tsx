import { Box, NumberInput, Slider, Text } from "@mantine/core";
import { mockMaterials } from "../../../Types/ArmorTypes";
import { useBallisticSimulatorFormContext } from "../../../Pages/BallisticsSimulator/ballistic-simulator-form-context";


interface DurabilityAndMaxPairProps {
    index: number
    wDura?:number | string
    wMaxDura?:number | string
}

export function DurabilityAndMaxPair({ index, wDura, wMaxDura }: DurabilityAndMaxPairProps) {
    const form = useBallisticSimulatorFormContext();

    return (
        <>
            <NumberInput
                inputWrapperOrder={['label', 'error', 'input', 'description']}
                label={
                    <Text size="sm">
                        Durability: <b>{((form.values.armorLayers[index].durability / form.values.armorLayers[index].maxDurability) * 100).toFixed(2)}%</b>
                    </Text>
                }
                description={
                    <>
                        <Slider
                            label={null}
                            precision={2}
                            max={form.values.armorLayers[index].maxDurability}
                            min={0}
                            step={1}
                            {...form.getInputProps(`armorLayers.${index}.durability`)}
                        />
                        <Text size="sm">
                            Effective Durability: <b>{(form.values.armorLayers[index].durability / mockMaterials.find(x => x.label === form.values.armorLayers[index].armorMaterial)!.destructibility).toFixed(2)} </b>
                        </Text>
                    </>
                }
                precision={2}
                max={form.values.armorLayers[index].maxDurability}
                min={0}
                step={1}
                {...form.getInputProps(`armorLayers.${index}.durability`)}
                styles={() => ({
                    wrapper: {
                      marginBottom: 0,
                    },
                  })}
            />
            <Box w={wMaxDura}>
                <NumberInput
                    label="Max Durability"
                    type="number"
                    precision={2}
                    max={90}
                    min={6}
                    step={1}
                    {...form.getInputProps(`armorLayers.${index}.maxDurability`)}
                    onChange={(value) => {
                        if (value) {
                            if (form.values.armorLayers[index].durability > value) {
                                form.setFieldValue(`armorLayers.${index}.durability`, value)
                                // form.setValues( armorLayers[${index}]durability: value )
                            }
                            else if (form.values.armorLayers[index].durability === form.values.armorLayers[index].maxDurability) {
                                form.setFieldValue(`armorLayers.${index}.durability`, value)
                                // form.setValues({ armorLayers[0].durability: value })
                            }
                            form.setFieldValue(`armorLayers.${index}.maxDurability`, value);
                        }
                    }}
                />
                <Slider
                    label={null}
                    precision={2}
                    max={90}
                    min={6}
                    step={1}
                    {...form.getInputProps(`armorLayers.${index}.maxDurability`)}
                    onChange={(maxDura) => {
                        if (maxDura) {
                            if (form.values.armorLayers[index].durability > maxDura) {
                                // form.setValues({ durability: maxDura })
                                form.setFieldValue(`armorLayers.${index}.durability`, maxDura)
                            }
                            else if (form.values.armorLayers[index].durability === form.values.armorLayers[index].maxDurability) {
                                // form.setValues({ durability: maxDura })
                                form.setFieldValue(`armorLayers.${index}.durability`, maxDura)
                            }
                            form.setFieldValue(`armorLayers.${index}.maxDurability`, maxDura);
                        }
                    }}
                    onChangeEnd={(value) => {
                        if (value) {
                            if (form.values.armorLayers[index].durability > value) {
                                form.setFieldValue(`armorLayers.${index}.durability`, value)
                            }
                            form.setFieldValue(`armorLayers.${index}.maxDurability`, value);
                        }
                    }}
                />
            </Box>
        </>
    )
}