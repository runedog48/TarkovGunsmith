import { MRT_Cell, MRT_Row } from "mantine-react-table";
import { createHitZoneValues_ArmorTableRow } from "../../Helpers/ArmorHelpers";
import { HoverCard, Text } from "@mantine/core";
import { NewArmorTableRow } from "../../../../Types/ArmorTypes";

export function ArmorBluntDamageCell<T extends {}>(cell: MRT_Cell<T>, row: MRT_Row<NewArmorTableRow>) {
    const isChilde = row.getParentRow() !== undefined;
    const rowHitZones = createHitZoneValues_ArmorTableRow(row.original);

    if (isChilde && rowHitZones.some(x => x.includes('SAPI') || x.includes('Korund') || x.includes('6B13'))) {
        return (
            <HoverCard shadow="md">
                <HoverCard.Target>
                    <Text size="sm">
                        {(cell.getValue<number>()).toFixed(2)} %
                    </Text>
                </HoverCard.Target>
                <HoverCard.Dropdown >
                    <Text fw={400} style={{ whiteSpace: "normal" }}>
                        As of patch 14.0.0, plate collider armor doesn't have blunt damage.
                    </Text>
                </HoverCard.Dropdown>
            </HoverCard>
        )
    }
    return (<>{(cell.getValue<number>()).toFixed(2)} %</>)
}