import { useDisclosure } from '@mantine/hooks';
import { Drawer, Button, Group, Title, Tooltip } from '@mantine/core';
import { ReactNode } from 'react';
import { SearchSelectAmmoTable } from '../Tables/searchTables/SearchSelectAmmoTable';
import { SearchSelectArmorTable } from '../Tables/searchTables/SearchSelectArmorTable';
import { SearchSelectAmmoTable_Calc } from '../Tables/searchTables/SearchSelectAmmoTable_calculator';


export interface DrawerButtonProps {
    buttonLabel: string | ReactNode
    leftIcon?: ReactNode
    ammoOrArmor: "ammo" | "armor" | "calc_ammo"
    armorIndex?: number
}

export function DrawerButton({ leftIcon, ammoOrArmor, armorIndex }: DrawerButtonProps) {
    const [opened, { open, close }] = useDisclosure(false);

    const ammoContent = (
        <>
            <Drawer.Header>
                <Drawer.Title><Title order={4}>Search Projectile - Click to select</Title></Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
                <SearchSelectAmmoTable CloseDrawerCb={close} />
            </Drawer.Body>
        </>
    )

    const calcAmmoContent = (
        <>
            <Drawer.Header>
                <Drawer.Title><Title order={4}>Search Projectile - Click to select</Title></Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
                <SearchSelectAmmoTable_Calc CloseDrawerCb={close} />
            </Drawer.Body>
        </>
    )

    const armorContent = (
        <>
            <Drawer.Header>
                <Drawer.Title><Title order={4}>Search Armor - Click to select</Title></Drawer.Title>
            </Drawer.Header>
            <Drawer.Body >
                <SearchSelectArmorTable CloseDrawerCb={close} layerIndex={armorIndex !== undefined ? armorIndex : 1} />
            </Drawer.Body>
        </>
    )

    return (
        <>
            <Drawer.Root opened={opened} onClose={close} size={ammoOrArmor === "ammo" ? "lg" : "1300px"}>
                <Drawer.Overlay />
                <Drawer.Content>
                    {ammoOrArmor === "ammo" && (
                        ammoContent
                    )}
                    {ammoOrArmor === "armor" && (
                        armorContent
                    )}
                    {ammoOrArmor === "calc_ammo" && (
                        calcAmmoContent
                    )}
                </Drawer.Content>
            </Drawer.Root>

            <Tooltip label="Search" transitionProps={{ transition: 'slide-up', duration: 300 }} data-html2canvas-ignore>
                <Group position="center">
                    <Button variant='light' size={"xs"} onClick={open}>{leftIcon}</Button>
                </Group>
            </Tooltip>

        </>
    );
}