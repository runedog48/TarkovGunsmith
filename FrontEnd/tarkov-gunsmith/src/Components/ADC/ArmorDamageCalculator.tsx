import { SetStateAction, useEffect, useState } from 'react';
import { Row, Col, Form, Button, Stack, Card, Modal, ToggleButton, ToggleButtonGroup, Table, Spinner, Accordion, Container, Tooltip as BSTooltip } from "react-bootstrap";
import { BallisticHit, NewArmorTestResult, NewCustomTestResult, TransmissionArmorTestResult, TransmissionArmorTestShot, TargetZone } from '../../Context/ArmorTestsContext';
import { requestArmorTestSerires, requestArmorTestSerires_Custom } from "../../Context/Requests";

import SelectArmor from './SelectArmor';
import SelectAmmo from './SelectAmmo';
import FilterRangeSelector from '../Forms/FilterRangeSelector';
import { ArmorOption, ARMOR_CLASSES, ARMOR_TYPES, filterArmorOptions, MATERIALS } from './ArmorData';
import { filterAmmoOptions, AmmoOption } from './AmmoData';
import { API_URL } from '../../Util/util';
import html2canvas from 'html2canvas';
import { copyImageToClipboard } from 'copy-image-clipboard';
import { LINKS } from '../../Util/links';
import { useParams } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Flex, Paper, Text } from '@mantine/core';
import { margin } from '@mui/system';

export default function ArmorDamageCalculator(props: any) {
    const navigate = useNavigate();
    const { id_armor } = useParams();
    const { id_ammo } = useParams();


    // Info Modal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    let ModalInfo = (
        <>
            <Button variant="info" onClick={handleShow}>
                Info
            </Button>

            <Modal show={show} onHide={handleClose} style={{color:"black"}}>
                <Modal.Header closeButton>
                    <Modal.Title>Information - ADC</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Custom mode allows you to set the stats of the armor and ammo to whatever you want. The defaults are for RatRig vs 7.62x39 PS.</p>
                    <h5>Glossary:</h5>
                    <p><strong>🛡 Armor Class:</strong> How strong your armor can be.</p>
                    <p><strong>⛓ Max Durability:</strong> How tough your armor can be.</p>
                    <p><strong>⚖ Effective Durability:</strong> Durability divided by the armor material factor, allows you to compare the toughness of armors with different materials directly.</p>
                    <p><strong>⛏ Penetration:</strong> How well your bullet goes through armor.</p>
                    <p><strong>📐 Armor Damage Percentage:</strong> The percentage applied to penetration get armor damage, regular damage has nothing to do with it.</p>
                    <p><strong>💀 Damage:</strong> How much you will unalive someone on hits.</p>
                    <p><strong>👨‍🔧 Trader level:</strong> The trader level for a cash offer. 5 means it can be bought on flea market, 6 means found in raid only. -1 Means I broke something. <br />Note: the app does not account for barters yet.</p>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )

    //Armor Stuff
    const [defaultSelection_Armor, setDefaultSelection_Armor] = useState<ArmorOption>();

    const [ArmorOptions, setArmorOptions] = useState<ArmorOption[]>([]);

    const [armorId, setArmorId] = useState("");
    const [armorDurabilityMax, setArmorDurabilityMax] = useState(1);
    const [armorDurabilityNum, setArmorDurabilityNum] = useState(1);

    const [filteredArmorOptions, setFilteredArmorOptions] = useState(ArmorOptions);

    const [newArmorTypes, setNewArmorTypes] = useState(ARMOR_TYPES);
    const handleNewArmorTypesTBG = (val: SetStateAction<string[]>) => setNewArmorTypes(val);

    const [newArmorClasses, setNewArmorClasses] = useState(ARMOR_CLASSES);
    const [newMaterials, setNewMaterials] = useState(MATERIALS);



    const armors = async () => {
        const response = await fetch(API_URL + '/GetArmorOptionsList');
        setArmorOptions(await response.json())
    }
    // This useEffect will update the ArmorOptions with the result from the async API call
    useEffect(() => {
        armors();
    }, [])
    // This useEffect will watch for a change to WeaponOptions or filter options, then update the filteredStockWeaponOptions
    useEffect(() => {
        setFilteredArmorOptions(filterArmorOptions(newArmorTypes, newArmorClasses, newMaterials, ArmorOptions));
    }, [newArmorTypes, ArmorOptions, newArmorClasses, newMaterials])

    const handleNewArmorClassesTBG = (val: SetStateAction<number[]>) => {
        if (val.length > 0) {
            setNewArmorClasses(val);
        }
    }

    const handleNewMaterialsTBG = (val: SetStateAction<string[]>) => {
        if (val.length > 0) {
            setNewMaterials(val);
        }
    }

    useEffect(() => {
        if (id_armor !== undefined && ArmorOptions.length > 0) {
            var temp = ArmorOptions.find((x) => x.value === id_armor)
            if (temp !== undefined) {
                handleArmorSelection(temp);
                setDefaultSelection_Armor(temp);
                // setArmorDurabilityMax(temp.maxDurability);
                // setArmorDurabilityNum(temp.maxDurability);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ArmorOptions, id_armor])

    //! Handle Selections - Got tired of scrolling  to find the damn things
    function handleArmorSelection(selectedOption: ArmorOption) {
        setArmorId(selectedOption.value);
        setArmorDurabilityMax(selectedOption.maxDurability!);
        setArmorDurabilityNum(selectedOption.maxDurability!);

        // console.log("armorId -hndlArmor", selectedOption.value)
        // console.log("ammoId -hndlArmor", ammoId)

        if (ammoId !== "") {
            requestData(selectedOption.value, ammoId)
            navigate(`${LINKS.DAMAGE_SIMULATOR}/${selectedOption.value}/${ammoId}`);
        }
    }

    function handleAmmoSelection(selectedOption: AmmoOption) {
        setAmmoId(selectedOption.value);

        // console.log("armorId -hndlAmmo", armorId)
        // console.log("ammoId -hndlAmmo", selectedOption.value)

        if (armorId !== "") {
            requestData(armorId, selectedOption.value)
            navigate(`${LINKS.DAMAGE_SIMULATOR}/${armorId}/${selectedOption.value}`);
        }
    }

    function handleSubmit(e: any) {
        e.preventDefault();
        requestData(armorId, ammoId);
    }
    //! Request Data
    function requestData(_armorId: string, _ammoId: string) {

        // console.log("_armorId - requestData", _armorId)
        // console.log("_ammoId - requestData", _ammoId)

        const requestDetails = {
            armorId: _armorId,
            armorDurability: (armorDurabilityNum / armorDurabilityMax * 100),
            ammoId: _ammoId,
        }
        requestArmorTestSerires(requestDetails).then((response: NewArmorTestResult) => {
            // // console.log(response)
            setResult(response);
            setChartData(response.ballisticTest.hits);

        }).catch(error => {
            alert(`The error was: ${error}`);
            // // console.log(error);
        });
    }

    const [result, setResult] = useState<NewArmorTestResult>();
    const [chartData, setChartData] = useState<BallisticHit[]>([]);
    const [chartDataCustom, setChartDataCustom] = useState<BallisticHit[]>([]);

    // Ammo Stuff
    const [defaultSelection_Ammo, setDefaultSelection_Ammo] = useState<AmmoOption>();

    const [AmmoOptions, setAmmoOptions] = useState<AmmoOption[]>([]);

    const [ammoId, setAmmoId] = useState("");

    const [minDamage, setMinDamage] = useState(25); // Need to make these values be drawn from something rather than magic numbers
    const [smallestDamage] = useState(25);
    const [biggestDamage] = useState(192);

    const [minPenPower, setMinPenPower] = useState(0); // Need to make these values be drawn from something rather than magic numbers
    const [smallestPenPower] = useState(0);
    const [biggestPenPower] = useState(79);

    const [minArmorDamPerc, setArmorDamPerc] = useState(0); // Need to make these values be drawn from something rather than magic numbers
    const [smallestArmorDamPerc] = useState(0);
    const [biggestArmorDamPerc] = useState(89);

    const [traderLevel, setTraderLevel] = useState(6); // Need to make these values be drawn from something rather than magic numbers
    const [smallestTraderLevel] = useState(1);
    const [biggestTraderLevel] = useState(6); // 5 is for FLea market, 6 is for FIR

    const [rateOfFire, setRateOfFire] = useState(650);


    const [filteredAmmoOptions, setFilteredAmmoOptions] = useState(AmmoOptions);

    const [calibers, setCalibers] = useState([
        "Caliber86x70",
        "Caliber127x55",
        "Caliber762x54R",
        "Caliber762x51",

        "Caliber762x39",
        "Caliber545x39",
        "Caliber556x45NATO",
        "Caliber762x35",
        "Caliber366TKM",
        "Caliber9x39",

        "Caliber46x30",
        "Caliber9x21",
        "Caliber57x28",
        "Caliber1143x23ACP",

        "Caliber9x19PARA",
        "Caliber9x18PM",
        "Caliber762x25TT",
        "Caliber9x33R",

        "Caliber12g",
        "Caliber23x75"
    ]);

    const FULL_POWER = ["Caliber86x70", "Caliber127x55", "Caliber762x54R", "Caliber762x51"];
    const FULL_POWER_DISPLAY = ["338 Lapua Mag", "12.7x55mm", "7.62x54mmR", "7.62x51mm"];
    const [fullPower, setFullPower] = useState(FULL_POWER);
    const handleNewFullpower = (val: SetStateAction<string[]>) => {
        setFullPower(val);

        const arr: any = [val, intermediate, pistol, shotgun].flat();
        setCalibers(arr)
    }

    const INTERMEDIATE = ["Caliber762x39", "Caliber545x39", "Caliber556x45NATO", "Caliber762x35", "Caliber366TKM", "Caliber9x39"];
    const INTERMEDIATE_DISPLAY = ["7.62x39", "5.45x39", "5.56x45", ".300 Blackout", ".366 TKM", "9x39"];
    const [intermediate, setIntermediate] = useState(INTERMEDIATE);
    const handleNewIntermediate = (val: SetStateAction<string[]>) => {
        setIntermediate(val);

        const arr: any = [fullPower, val, pistol, shotgun].flat();
        setCalibers(arr)
    }

    const PISTOL = ["Caliber46x30", "Caliber9x21", "Caliber57x28", "Caliber1143x23ACP", "Caliber9x19PARA", "Caliber9x18PM", "Caliber762x25TT", "Caliber9x33R"];
    const PISTOL_DISPLAY = ["4.6x30", "9x21", "5.7x28", ".45 ACP", "9x19", "9x18", "7.62 TT", ".357"];
    const [pistol, setPistol] = useState(PISTOL);
    const handleNewPistol = (val: SetStateAction<string[]>) => {
        setPistol(val);

        const arr: any = [fullPower, intermediate, val, shotgun].flat();
        setCalibers(arr)
    }

    const SHOTGUN = ["Caliber12g", "Caliber23x75"];
    const SHOTGUN_DISPLAY = ["12g", "23mm"];
    const [shotgun, setShotgun] = useState(SHOTGUN);
    const handleNewShotgun = (val: SetStateAction<string[]>) => {
        setShotgun(val);

        const arr: any = [fullPower, intermediate, pistol, val].flat();
        setCalibers(arr)
    }

    // Look at replacing item 2 with item 5 as you may not need item 2 in practice.
    //! Now that you know how to use useEffect, p[robs need to redo this whole area with it in mind.]
    const AMMO_CALIBERS = [
        ["Full Rifle", fullPower, setFullPower, FULL_POWER, FULL_POWER_DISPLAY, handleNewFullpower],
        ["Intermediate Rifle", intermediate, setIntermediate, INTERMEDIATE, INTERMEDIATE_DISPLAY, handleNewIntermediate],
        ["PDW / Pistol", pistol, setPistol, PISTOL, PISTOL_DISPLAY, handleNewPistol],
        ["Shotgun", shotgun, setShotgun, SHOTGUN, SHOTGUN_DISPLAY, handleNewShotgun],
    ] //     0        1         2          3         4                     5

    function handleMinDamageChange(input: number) {
        setMinDamage(input);
    }
    function handleMinPenPowerChange(input: number) {
        setMinPenPower(input);
    }
    function handleMinArmorDamPercChange(input: number) {
        setArmorDamPerc(input);
    }
    function handleTraderLevelChange(input: number) {
        setTraderLevel(input);
    }

    const ammos = async () => {
        const response = await fetch(API_URL + '/GetAmmoOptionsList');
        setAmmoOptions(await response.json())
    }
    // This useEffect will update the ArmorOptions with the result from the async API call
    useEffect(() => {
        ammos();
    }, [])
    // This useEffect will watch for a change to WeaponOptions or filter options, then update the filteredStockWeaponOptions
    useEffect(() => {
        setFilteredAmmoOptions(filterAmmoOptions(AmmoOptions, minDamage, minPenPower, minArmorDamPerc, traderLevel, calibers));
    }, [AmmoOptions, minDamage, minPenPower, minArmorDamPerc, traderLevel, calibers])

    useEffect(() => {
        if (id_ammo !== undefined && AmmoOptions.length > 0) {

            var temp = AmmoOptions.find((x) => x.value === id_ammo)
            if (temp !== undefined) {
                handleAmmoSelection(temp);
                setDefaultSelection_Ammo(temp);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [AmmoOptions, id_ammo])

    //Custom Mode
    const [customCalculation, setCustomCalculation] = useState(false);
    const handleEnableCustomCal = () => setCustomCalculation(true);
    const handleDisableCustomCal = () => setCustomCalculation(false);

    const [armorClass, setArmorClass] = useState(4);
    const [armorMaterial, setArmorMaterial] = useState("Titan");
    const [armorDurabilityNum_Custom, setArmorDurabilityNum_Custom] = useState(40);
    const [armorDurabilityMax_Custom, setArmorDurabilityMax_Custom] = useState(40);
    const [armorBluntThroughput_Custom, setArmorBluntThroughput_Custom] = useState(20);

    const [penetration, setPenetration] = useState(35);
    const [armorDamagePerc, setArmorDamagePerc] = useState(52);

    const [errorPenetration, setErrorPenetration] = useState("");

    const [damage, setDamage] = useState(50);
    const [errorDamage, setErrorDamage] = useState("");

    const [targetZone_Custom, setTargetZone_Custom] = useState<"Thorax" | "Head">("Thorax");

    const [resultCustom, setResultCustom] = useState<NewCustomTestResult>();

    const handleCustomSubmit = (e: any) => {
        e.preventDefault();

        if (penetration < 1) {
            setErrorPenetration("Sorry, value must be above 1 for now.")
        }
        else if (penetration > 79) {
            setErrorPenetration("Sorry, value must be below 80 for now.")
        }
        else if (damage > 450) {
            setErrorDamage("Sorry, value must be below 450 for now")
        }
        else {
            setErrorPenetration("")
            setErrorDamage("")
            const requestDetails = {
                armorClass: armorClass,
                armorMaterial: armorMaterial,
                armorDurabilityPerc: (armorDurabilityNum_Custom / armorDurabilityMax_Custom * 100),
                armorDurabilityMax: armorDurabilityMax_Custom,
                bluntThroughput: armorBluntThroughput_Custom / 100, //Alas, the form component only seems to deal in ints
                penetration: penetration,
                armorDamagePerc: armorDamagePerc,
                damage: damage,
                targetZone: targetZone_Custom
            }

            requestArmorTestSerires_Custom(requestDetails).then(response => {
                // console.log(response);
                
                setResultCustom(response);
                setChartDataCustom(response.hits);
            }).catch(error => {
                alert(`The error was: ${error}`);
                // // console.log(error);
            });
        }
    }

    const handleImageDownload = async () => {
        const element: any = document.getElementById('print'),
            canvas = await html2canvas(element),
            data = canvas.toDataURL('image/png'),
            link = document.createElement('a');

        link.href = data;
        if (result !== undefined) {
            link.download = `${result.testName}.png`;
        }
        else {
            link.download = "TarkovGunsmith_ADC_Chart.png"
        }


        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyImage = async () => {
        try {
            const element: any = document.getElementById('print'),
                canvas = await html2canvas(element),
                data = canvas.toDataURL('image/png');

            if (data) await copyImageToClipboard(data)
        } catch (e: any) {
            if (e?.message) alert(e.message)
        }
    }


    // assume that a <div className="row gy-2"> is around the cards

    let topCard = (
        <Col xl>
            <Card bg="dark" border="secondary" text="light" className="xl" >

                <Card.Header as="h2" >
                    <Stack direction="horizontal" gap={3}>
                        Terminal Ballistics Simulator - Presets
                        <div className="ms-auto">
                            <Stack direction='horizontal' gap={2}>
                                <Button variant="secondary" onClick={handleEnableCustomCal}>Change mode to Custom</Button>
                                {ModalInfo}
                            </Stack>
                        </div>
                    </Stack>
                </Card.Header>

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col xl>
                            <Card.Header as="h4">🛡 Armor Selection</Card.Header>
                            <Accordion flush>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header><strong>Armor Filters</strong></Accordion.Header>
                                    <Accordion.Body>
                                        Armor Type <br />
                                        <Button size="sm" variant="outline-warning" onClick={(e) => handleNewArmorTypesTBG(["ArmorVest", "ChestRig", "Helmet", "ArmoredEquipment"])}> All</Button>{' '}
                                        <ToggleButtonGroup size="sm" type="checkbox" value={newArmorTypes} onChange={handleNewArmorTypesTBG}>
                                            {ARMOR_TYPES.map((item: any, i: number) => {
                                                return (
                                                    <ToggleButton key={JSON.stringify(item)} variant='outline-primary' id={`tbg-btn-${item}`} value={item}>
                                                        {item}
                                                    </ToggleButton>
                                                )
                                            })}
                                        </ToggleButtonGroup>

                                        <br />
                                        Armor Class <br />
                                        <Button size="sm" variant="outline-warning" onClick={(e) => handleNewArmorClassesTBG(ARMOR_CLASSES)}>All</Button>{' '}
                                        <ToggleButtonGroup size="sm" type="checkbox" value={newArmorClasses} onChange={handleNewArmorClassesTBG}>
                                            {ARMOR_CLASSES.map((item: any, i: number) => {
                                                return (
                                                    <ToggleButton key={JSON.stringify(item)} variant='outline-primary' id={`tbg-btn-ac${item}`} value={item}>
                                                        {item}
                                                    </ToggleButton>
                                                )
                                            })}
                                        </ToggleButtonGroup>

                                        <br />
                                        Armor Material <br />
                                        <Button size="sm" variant="outline-warning" onClick={(e) => handleNewMaterialsTBG(MATERIALS)}>All</Button>{' '}
                                        <ToggleButtonGroup size="sm" type="checkbox" value={newMaterials} onChange={handleNewMaterialsTBG} style={{ flexWrap: "wrap" }}>
                                            {MATERIALS.map((item: string, i: number) => {
                                                return (
                                                    <ToggleButton key={JSON.stringify(item)} variant='outline-primary' id={`tbg-btn-${item}`} value={item}>
                                                        {item}
                                                    </ToggleButton>
                                                )
                                            })}
                                        </ToggleButtonGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Card.Body style={{ paddingTop: "1px" }}>
                                <strong>Available Choices:</strong> {filteredArmorOptions.length} <br />
                                <Form.Text>You can search by the name by selecting this box and typing.</Form.Text>
                                <SelectArmor handleArmorSelection={handleArmorSelection} armorOptions={filteredArmorOptions} selectedId={armorId} defaultSelection={defaultSelection_Armor} />

                                <br />

                                <Form.Group className="mb-3">
                                    <Row>
                                        <Col>
                                            <Form.Label>Armor Durability</Form.Label>
                                            <Form.Range value={armorDurabilityNum} max={armorDurabilityMax} onChange={(e) => { setArmorDurabilityNum(parseInt(e.target.value)) }} />
                                        </Col>
                                        <Col style={{ maxWidth: "90px" }}>
                                            <Form.Label>Number</Form.Label>
                                            <Form.Control disabled value={armorDurabilityNum} onChange={(e) => { setArmorDurabilityNum(parseInt(e.target.value)) }} />
                                        </Col>
                                        <Col style={{ maxWidth: "110px" }}>
                                            <Form.Label>Percentage</Form.Label>
                                            <Form.Control disabled={true} value={(armorDurabilityNum / armorDurabilityMax * 100).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "%"} />
                                        </Col>
                                    </Row>
                                </Form.Group>
                                {armorId !== "" && (
                                    <div className="d-grid gap-2">
                                        <LinkContainer to={`${LINKS.ARMOR_VS_AMMO}/${armorId}`}>
                                            <Button variant="outline-info" style={{ width: "100%" }}>
                                                See this armor in <strong>Armor</strong> vs Ammo.
                                            </Button>
                                        </LinkContainer>
                                    </div>
                                )}
                            </Card.Body>
                        </Col>

                        <Col xl>
                            <Card.Header as="h4">⚔ Ammo Selection</Card.Header>
                            <Accordion flush>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header><strong>Ammo Filters</strong></Accordion.Header>
                                    <Accordion.Body>
                                        {
                                            AMMO_CALIBERS.map((caliber: any, i: number) => {
                                                return (
                                                    <>
                                                        {caliber[0]}
                                                        <br />
                                                        <Button size="sm" variant="outline-success" onClick={(e) => caliber[5](caliber[3])}> All</Button>{' '}
                                                        <Button size="sm" variant="outline-danger" onClick={(e) => caliber[5](!caliber[3])}> All</Button>{' '}
                                                        <ToggleButtonGroup size="sm" type="checkbox" value={caliber[1]} onChange={caliber[5]} style={{ flexWrap: "wrap" }}>
                                                            {caliber[4].map((value: any, i: number) => {
                                                                return (
                                                                    <ToggleButton key={JSON.stringify(caliber[3][i])} variant='outline-primary' id={`tbg-btn-${caliber[3][i]}`} value={caliber[3][i]}>
                                                                        {value}
                                                                    </ToggleButton>
                                                                )
                                                            })}
                                                        </ToggleButtonGroup>
                                                        <br />
                                                    </>
                                                )
                                            })
                                        }
                                        <Row>
                                            <Col>
                                                <FilterRangeSelector
                                                    label={"Minimum Damage"}
                                                    value={minDamage}
                                                    changeValue={handleMinDamageChange}
                                                    min={smallestDamage}
                                                    max={biggestDamage}
                                                />
                                                <FilterRangeSelector
                                                    label={"Minimum Penetration Power"}
                                                    value={minPenPower}
                                                    changeValue={handleMinPenPowerChange}
                                                    min={smallestPenPower}
                                                    max={biggestPenPower}
                                                />
                                            </Col>
                                            <Col>
                                                <FilterRangeSelector
                                                    label={"Minimum Armor Damage %"}
                                                    value={minArmorDamPerc}
                                                    changeValue={handleMinArmorDamPercChange}
                                                    min={smallestArmorDamPerc}
                                                    max={biggestArmorDamPerc}
                                                />
                                                <FilterRangeSelector
                                                    label={"Trader 1-4, Flea=5, FIR=6"}
                                                    value={traderLevel}
                                                    changeValue={handleTraderLevelChange}
                                                    min={smallestTraderLevel}
                                                    max={biggestTraderLevel}
                                                />
                                            </Col>
                                        </Row>
                                    </Accordion.Body>
                                </Accordion.Item>

                            </Accordion>
                            <Card.Body style={{ paddingTop: "1px" }}>
                                <>

                                    <strong>Available Choices:</strong> {filteredAmmoOptions.length} <br />
                                    <Form.Text>You can search by the name by selecting this box and typing. </Form.Text>
                                    <SelectAmmo handleAmmoSelection={handleAmmoSelection} ammoOptions={filteredAmmoOptions} selectedId={ammoId} defaultSelection={defaultSelection_Ammo} />
                                </>

                                <br />

                                <Form.Group className="mb-3" style={{ paddingTop: "7.5px" }}>
                                    <Row>
                                        <Col>
                                            <Form.Label>Rate Of Fire</Form.Label>
                                            <Form.Range value={rateOfFire} max={1200} onChange={(e) => { setRateOfFire(parseInt(e.target.value)) }} />
                                        </Col>
                                        <Col style={{ maxWidth: "140px" }}>
                                            <Form.Label>Number</Form.Label>
                                            <Form.Control value={rateOfFire} onChange={(e) => { setRateOfFire(parseInt(e.target.value)) }} />
                                        </Col>

                                    </Row>
                                </Form.Group>
                                {ammoId !== "" && (
                                    <div className="d-grid gap-2">
                                        <LinkContainer to={`${LINKS.AMMO_VS_ARMOR}/${ammoId}`}>
                                            <Button variant="outline-info" style={{ width: "100%" }}>
                                                See this ammo in <strong>Ammo</strong> vs Armor.
                                            </Button>
                                        </LinkContainer>
                                    </div>
                                )}

                            </Card.Body>

                        </Col>
                    </Row>
                    <Card.Footer>
                        <div className="d-grid gap-2">
                            <Button variant="success" type="submit" className='form-btn'>
                                Simulate / Update
                            </Button>
                        </div>
                    </Card.Footer>

                </Form>

            </Card>
        </Col>
    )

    if (customCalculation === true) {
        topCard = (
            <>
                <Card bg="dark" border="secondary" text="light" className="xl" >

                    <Card.Header as="h2" >
                        <Stack direction="horizontal" gap={3}>
                            Terminal Ballistics Simulator - Custom
                            <div className="ms-auto">
                                <Stack direction='horizontal' gap={2}>
                                    <Button variant="secondary" onClick={handleDisableCustomCal}>Change mode to Presets</Button>
                                    {ModalInfo}
                                </Stack>
                            </div>
                        </Stack>
                    </Card.Header>
                    <Form onSubmit={handleCustomSubmit}>
                        <Row>
                            <Col xl>
                                <Card.Header as="h4">🛡 Armor settings</Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="md" controlId="ArmorClass">
                                                <Form.Label>🛡 Armor Class</Form.Label>
                                                <Form.Select aria-label="Default select example" defaultValue={armorClass} onChange={(e) => { setArmorClass(parseInt(e.target.value)) }}>
                                                    <option value={2}>2</option>
                                                    <option value={3}>3</option>
                                                    <option value={4}>4</option>
                                                    <option value={5}>5</option>
                                                    <option value={6}>6</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <br />

                                            <Form.Group className="md" controlId="ArmorClass">
                                                <Form.Label>🧱 Armor Material</Form.Label>
                                                <Form.Select aria-label="Default select example" value={armorMaterial} onChange={(e) => { setArmorMaterial(e.target.value) }}>
                                                    <option value={"Aramid"}>Aramid</option>
                                                    <option value={"UHMWPE"}>UHMWPE</option>
                                                    <option value={"Combined"}>Combined</option>
                                                    <option value={"Aluminium"}>Aluminium</option>
                                                    <option value={"Titan"}>Titan</option>
                                                    <option value={"ArmoredSteel"}>ArmoredSteel</option>
                                                    <option value={"Ceramic"}>Ceramic</option>
                                                    <option value={"Glass"}>Glass</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={7}>
                                            <Form.Group controlId="MaxDurability">
                                                <Form.Label>🔧 Armor Durability Max</Form.Label>
                                                <Form.Control type="number" placeholder="Enter max durability as a number" defaultValue={armorDurabilityMax_Custom}
                                                    onChange={(e) => {
                                                        if (parseInt(e.target.value) < 1) {
                                                            e.target.value = "1"
                                                        } // It's jank, but it werks

                                                        setArmorDurabilityMax_Custom(parseInt(e.target.value))
                                                        setArmorDurabilityNum_Custom(parseInt(e.target.value))
                                                    }}
                                                />
                                                <Form.Text className="text-muted">
                                                    Eg: "40" without quotes.
                                                </Form.Text>
                                            </Form.Group>

                                            <Form.Group>
                                                <Row>
                                                    <Col md>
                                                        <Form.Label>Starting Armor Durability</Form.Label>
                                                        <Form.Range value={armorDurabilityNum_Custom} min={1} max={armorDurabilityMax_Custom} onChange={(e) => { setArmorDurabilityNum_Custom(parseInt(e.target.value)) }} />
                                                    </Col>
                                                    <Col md="3">
                                                        <Form.Label>Number</Form.Label>
                                                        <Form.Control disabled value={armorDurabilityNum_Custom} onChange={(e) => { setArmorDurabilityNum_Custom(parseInt(e.target.value)) }} />

                                                    </Col>
                                                    <Col md="4">
                                                        <Form.Label>Percentage</Form.Label>
                                                        <Form.Control disabled={true} value={(armorDurabilityNum_Custom / armorDurabilityMax_Custom * 100).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "%"} />
                                                    </Col>
                                                </Row>

                                            </Form.Group>

                                        </Col>
                                        <Row>
                                            <Col md="7">
                                                <Form.Label>Blunt Damage Throughput %</Form.Label>
                                                <Form.Range value={armorBluntThroughput_Custom} min={4} max={60} onChange={(e) => { setArmorBluntThroughput_Custom(parseFloat(e.target.value)) }} />
                                            </Col>
                                            <Col md="4">
                                                <Form.Label>BDT %</Form.Label>
                                                <Form.Control value={armorBluntThroughput_Custom} onChange={(e) => { setArmorBluntThroughput_Custom(parseFloat(e.target.value)) }} />
                                            </Col>
                                            <Form.Text className="text-muted">
                                                Min is 4%, max is 60%, average is 20%.
                                            </Form.Text>
                                        </Row>
                                    </Row>

                                </Card.Body>

                            </Col>
                            <Col xl>
                                <Card.Header as="h4">⚔ Ammo settings</Card.Header>
                                <Card.Body>

                                    <Row>
                                        <Col md={3}>
                                            <Form.Group className="md" controlId="Penetration">
                                                <Form.Label>⛏ Penetration</Form.Label>
                                                {errorPenetration === "" &&
                                                    <>
                                                        <Form.Control type="number" placeholder="Enter penetration as a number" defaultValue={penetration}
                                                            onChange={(e) => {
                                                                if (parseInt(e.target.value) < 1) {
                                                                    e.target.value = "1"
                                                                } // It's jank, but it werks
                                                                setPenetration(parseInt(e.target.value))
                                                            }}
                                                        />
                                                    </>}
                                                {errorPenetration.includes("Sorry,") &&
                                                    <>
                                                        <Form.Control isInvalid type="number" placeholder="Enter penetration as a number" defaultValue={penetration} onChange={(e) => { setPenetration(parseInt(e.target.value)) }} />
                                                    </>}
                                                <Form.Text className="text-muted">
                                                    Eg: "35".
                                                </Form.Text>
                                                <br />
                                                <Form.Text className="text-danger"> {errorPenetration}</Form.Text>

                                            </Form.Group>
                                        </Col>

                                        <Col md={7}>
                                            <Form.Group>
                                                <Row>
                                                    <Col md>
                                                        <Form.Label>📏 Armor Damage Percentage</Form.Label>
                                                        <Form.Range value={armorDamagePerc} max={100} min={1} onChange={(e) => { setArmorDamagePerc(parseInt(e.target.value)) }} />
                                                    </Col>
                                                    <Col md="3">
                                                        <Form.Text>ADP</Form.Text>
                                                        <Form.Control disabled value={armorDamagePerc} onChange={(e) => { setArmorDamagePerc(parseInt(e.target.value)) }} />
                                                    </Col>
                                                </Row>
                                            </Form.Group>
                                        </Col>


                                    </Row>
                                    <Row>
                                        <Col md={3}>
                                            <Form.Group className="md" controlId="Penetration">
                                                <Form.Label>💀 Damage</Form.Label>
                                                {errorDamage === "" &&
                                                    <>
                                                        <Form.Control type="number" placeholder="Enter damage as a number" defaultValue={damage}
                                                            onChange={(e) => {
                                                                if (parseInt(e.target.value) < 1) {
                                                                    e.target.value = "1"
                                                                } // It's jank, but it werks
                                                                setDamage(parseInt(e.target.value))
                                                            }}
                                                        />
                                                    </>}
                                                {errorDamage.includes("Sorry,") &&
                                                    <>
                                                        <Form.Control isInvalid type="number" placeholder="Enter damage as a number" defaultValue={damage} onChange={(e) => { setDamage(parseInt(e.target.value)) }} />
                                                    </>}
                                                <Form.Text className="text-muted">
                                                    Eg: "50".
                                                </Form.Text>
                                                <br />
                                                <Form.Text className="text-danger"> {errorDamage}</Form.Text>

                                            </Form.Group>
                                        </Col>
                                        <br />
                                        <Col md={7}>
                                            <Form.Group className="mb-3">
                                                <Row>

                                                    <Col>
                                                        <Form.Label>Rate Of Fire</Form.Label>
                                                        <Form.Range value={rateOfFire} max={1200} onChange={(e) => { setRateOfFire(parseInt(e.target.value)) }} />
                                                    </Col>
                                                    <Col md="3">
                                                        <Form.Label>Number</Form.Label>
                                                        <Form.Control value={rateOfFire} onChange={(e) => { setRateOfFire(parseInt(e.target.value)) }} />
                                                    </Col>

                                                </Row>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Label>Target Zone</Form.Label>
                                            <Form.Select value={targetZone_Custom} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetZone_Custom(e.target.value as "Thorax" | "Head")}>
                                                <option value="Thorax">Thorax</option>
                                                <option value="Head">Head</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                </Card.Body>
                            </Col>
                        </Row>
                        <Card.Footer>
                            <div className="d-grid gap-2">
                                <Button variant="success" type="submit" className='form-btn'>
                                    Calculate
                                </Button>
                            </div>
                        </Card.Footer>
                    </Form>
                </Card>
            </>
        )
    }

    function formatYAxis(value: any, entry: number) {
        const num = parseFloat(value);
        if (num < 0) return "0";
        if (num > 100) return "100";
        return num.toString();
    }
    function statDelta(current: number, previous: number, unit: string = "") {

        const difference = current - previous;
        const colorVal = difference > 0 ? "#69DB7C" : difference < 0 ? "#FF8787" : ""
        if (difference !== 0) {
            return (
                // <>
                //      <Text c={color}> </Text>
                // </>
                <div style={{ display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
                    <span style={{ textAlign: 'left' }}>{current.toFixed(1)}{unit}&nbsp;</span>
                    <span style={{ textAlign: 'right', color: colorVal }}>Δ: {(difference).toFixed(2)}</span>
                </div>
            )
        }
        else {
            return (
                <>
                    {current.toFixed(1)}{unit}
                </>
            )
        }
    }


    let resultCard;
    if (result !== undefined && customCalculation === false) {
        resultCard = (
            <>
                <Col xl>
                    <Card bg="dark" border="secondary" text="light" className="xl" id="print">
                        <Card.Header as="h4">
                            <Stack direction="horizontal" gap={3}>
                                📉 {result.testName} @{rateOfFire}rpm
                                <div className="ms-auto">
                                    <Stack direction='horizontal' gap={2}>
                                        <Button size='sm' variant="outline-info" onClick={handleImageDownload}>Download 📩</Button>
                                        <Button size='sm' variant="outline-info" onClick={handleCopyImage}>Copy 📋</Button>
                                    </Stack>
                                </div>
                            </Stack>
                        </Card.Header>

                        <Card.Body >
                            <Row>
                                <Col>
                                    <p>
                                        <strong>Expected hits to kill:</strong> {result.ballisticTest.probableKillShot}<br />
                                        <strong>Kill confidence at {result.ballisticTest.probableKillShot} hits:</strong> {(result.ballisticTest.hits[result.ballisticTest.probableKillShot - 1] as BallisticHit).cumulativeChanceOfKill.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} %<br />
                                        <strong>Expected time to kill:</strong> {((60 / rateOfFire) * result.ballisticTest.probableKillShot).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}s<br />
                                        <strong>Armor damage per hit:</strong> {result.ballisticTest.hits[1].durabilityDamageTotalAfterHit.toFixed(2)}
                                    </p>
                                    <dl>
                                        <dt>Assumptions:</dt>
                                        <dd>All hits hit thorax (85hp), or head. (35hp)</dd>
                                        <dt>Notes:</dt>
                                        <dd>Penetration Damage is the damage dealt to the target while accounting for damage mitigation by the armor.</dd>
                                        <dd>Average damage = (BluntDMG * (1 - penChance)) + (PenetratingDMG * penChance)</dd>
                                    </dl>
                                </Col>
                                <Col md={8} >
                                    <Paper mb={4}>
                                        <ResponsiveContainer width={"100%"} height={"100%"} minHeight={350} >
                                            <ComposedChart
                                                data={chartData}
                                                margin={{
                                                    top: 0,
                                                    right: -10,
                                                    left: 10,
                                                    bottom: 25,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="hitNum"
                                                    label={{ value: 'Hit ', position: 'bottom', offset: 0 }}
                                                />
                                                <YAxis
                                                    yAxisId="left"
                                                    orientation="left"
                                                    domain={[0, 100]}
                                                    label={{ value: 'Probability %', position: 'top', angle: -90, offset: -120 }}
                                                />
                                                <YAxis
                                                    yAxisId="right"
                                                    stroke="#FFD43B"
                                                    orientation="right"
                                                    domain={[0, "max"]}
                                                />

                                                <Tooltip
                                                    allowEscapeViewBox={{ x: false, y: true }}
                                                    contentStyle={{ backgroundColor: "#1A1B1E" }}
                                                    label={{}}
                                                />
                                                <Legend
                                                    layout='horizontal'
                                                    verticalAlign="top"
                                                />

                                                <Area
                                                    name="Cumulative Chance of Kill %"
                                                    yAxisId="left"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.cumulativeChanceOfKill).toFixed(1)}
                                                    stroke="#3BC9DB"
                                                    fill="#1098AD"
                                                    strokeWidth={2}
                                                    legendType='square'
                                                />
                                                <Area
                                                    name="Specific Chance of Kill %"
                                                    yAxisId="left"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.specificChanceOfKill).toFixed(1)}
                                                    stroke="#82C91E"
                                                    fill="#5C940D"
                                                    strokeWidth={2}
                                                    legendType='square'
                                                />

                                                <Line
                                                    name="Durability %"
                                                    yAxisId="left"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => ((row.durabilityBeforeHit / chartData[0].durabilityBeforeHit) * 100).toFixed(0)}
                                                    stroke="#F76707"
                                                    strokeWidth={2}
                                                />

                                                <Line
                                                    name="Penetration Damage"
                                                    yAxisId="right"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.penetrationDamage).toFixed(0)}
                                                    stroke="#FFD43B"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    name="Average Damage"
                                                    yAxisId="right"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => ((row.penetrationDamage * row.penetrationChance) + (row.bluntDamage * (1 - row.penetrationChance))).toFixed(0)}
                                                    stroke="#FAB005"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    name="Blunt Damage"
                                                    yAxisId="right"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.bluntDamage).toFixed(0)}
                                                    stroke="#FFD43B"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    name="Penetration %"
                                                    yAxisId="left"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.penetrationChance * 100).toFixed(0)}
                                                    stroke="red"
                                                    strokeWidth={2}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Col>
                            </Row>
                            <div style={{ overflow: "auto" }} >
                                <Table striped bordered hover variant="dark" responsive="sm" >
                                    <thead>
                                        <tr>
                                            <th>Hit</th>
                                            <th>Armor<br />Durability</th>
                                            <th>Durability<br />Percentage</th>
                                            <th>Done Armor<br />Damage</th>
                                            <th>Penetration<br />Chance</th>

                                            <th>Blunt<br />Damage</th>
                                            <th>Penetration<br />Damage</th>
                                            <th>Average<br />Damage</th>
                                            <th>Avg. HP<br />Remaining</th>

                                            <th>Cumulative<br />Chance of Kill</th>
                                            <th>Specific<br />Chance of Kill</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.ballisticTest.hits.map((item: BallisticHit, i: number) => {
                                            const armorObj = ArmorOptions.find(xArmor => xArmor.value === result.ballisticTest.armorId)
                                            return (
                                                <tr>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        {item.durabilityBeforeHit.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        {((item.durabilityBeforeHit / armorObj!.maxDurability) * 100).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        {item.durabilityDamageTotalAfterHit.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        {i === 0 && (item.penetrationChance * 100).toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + "%"}
                                                        {i > 0 && statDelta(result.ballisticTest.hits[i].penetrationChance * 100, result.ballisticTest.hits[i - 1].penetrationChance * 100, "%")}
                                                    </td>

                                                    <td>
                                                        {item.bluntDamage.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        {i === 0 && statDelta(result.ballisticTest.hits[i].penetrationDamage, result.ballisticTest.details.damage, "")}
                                                        {i > 0 && statDelta(result.ballisticTest.hits[i].penetrationDamage, result.ballisticTest.hits[i - 1].penetrationDamage, "")}
                                                    </td>
                                                    <td>
                                                        {((item.bluntDamage * (1 - item.penetrationChance) + (item.penetrationDamage * item.penetrationChance))).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</td>
                                                    <td>
                                                        {item.averageRemainingHitPoints.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>

                                                    <td>
                                                        {i === 0 && statDelta(result.ballisticTest.hits[i].cumulativeChanceOfKill, result.ballisticTest.hits[i].cumulativeChanceOfKill, "%")}
                                                        {i > 0 && statDelta(result.ballisticTest.hits[i].cumulativeChanceOfKill, result.ballisticTest.hits[i - 1].cumulativeChanceOfKill, "%")}

                                                    </td>
                                                    <td>
                                                        {i === 0 && statDelta(result.ballisticTest.hits[i].specificChanceOfKill, result.ballisticTest.hits[i].specificChanceOfKill, "%")}
                                                        {i > 0 && statDelta(result.ballisticTest.hits[i].specificChanceOfKill, result.ballisticTest.hits[i - 1].specificChanceOfKill, "%")}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                            <Form.Text>
                                This chart was generated on: {new Date().toUTCString()} and is from https://tarkovgunsmith.com{LINKS.DAMAGE_SIMULATOR}
                            </Form.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </>
        )
    }
    else if (customCalculation === true && resultCustom !== undefined) {
        resultCard = (
            <>
                <Col xl>
                    <Card bg="dark" border="secondary" text="light" className="xl" id="print">
                        <Card.Header as="h4">
                            <Stack direction="horizontal" gap={3}>
                                📉 Custom Ballistic Simulation
                                <div className="ms-auto">

                                    <Stack direction='horizontal' gap={2}>
                                        <Button size='sm' variant="outline-info" onClick={handleImageDownload}>Download 📩</Button>
                                        <Button size='sm' variant="outline-info" onClick={handleCopyImage}>Copy 📋</Button>
                                    </Stack>
                                </div>
                            </Stack>
                        </Card.Header>

                        <Card.Body >
                            <Row>
                                <Col>
                                    <p>
                                        <strong>Target Zone:</strong> {TargetZone[resultCustom.simulationParameters.targetZone]}<br />
                                        <strong>Expected hits to kill:</strong> {resultCustom.probableKillShot}<br />
                                        <strong>Kill confidence at {resultCustom.probableKillShot} hits:</strong> {(resultCustom.hits[resultCustom.probableKillShot - 1] as BallisticHit).cumulativeChanceOfKill.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} %<br />
                                        <strong>Expected time to kill:</strong> {((60 / rateOfFire) * resultCustom.probableKillShot).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}s<br />
                                        <strong>Armor damage per hit:</strong> {resultCustom.hits[1].durabilityDamageTotalAfterHit.toFixed(2)}
                                    </p>
                                    <dl>
                                        <dt>Notes:</dt>
                                        <dd>Penetration Damage is the damage dealt to the target while accounting for damage mitigation by the armor.</dd>
                                        <dd>Average damage = (BluntDMG * (1 - penChance)) + (PenetratingDMG * penChance)</dd>
                                    </dl>
                                </Col>
                                <Col xs={8}>
                                <Paper mb={4}>
                                        <ResponsiveContainer width={"100%"} height={"100%"} minHeight={350} >
                                            <ComposedChart
                                                data={chartDataCustom}
                                                margin={{
                                                    top: 0,
                                                    right: -10,
                                                    left: 10,
                                                    bottom: 25,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="hitNum"
                                                    label={{ value: 'Hit ', position: 'bottom', offset: 0 }}
                                                />
                                                <YAxis
                                                    yAxisId="left"
                                                    orientation="left"
                                                    domain={[0, 100]}
                                                    label={{ value: 'Probability %', position: 'top', angle: -90, offset: -120 }}
                                                />
                                                <YAxis
                                                    yAxisId="right"
                                                    stroke="#FFD43B"
                                                    orientation="right"
                                                    domain={[0, "max"]}
                                                />

                                                <Tooltip
                                                    allowEscapeViewBox={{ x: false, y: true }}
                                                    contentStyle={{ backgroundColor: "#1A1B1E" }}
                                                    label={{}}
                                                />
                                                <Legend
                                                    layout='horizontal'
                                                    verticalAlign="top"
                                                />

                                                <Area
                                                    name="Cumulative Chance of Kill %"
                                                    yAxisId="left"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.cumulativeChanceOfKill).toFixed(1)}
                                                    stroke="#3BC9DB"
                                                    fill="#1098AD"
                                                    strokeWidth={2}
                                                    legendType='square'
                                                />
                                                <Area
                                                    name="Specific Chance of Kill %"
                                                    yAxisId="left"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.specificChanceOfKill).toFixed(1)}
                                                    stroke="#82C91E"
                                                    fill="#5C940D"
                                                    strokeWidth={2}
                                                    legendType='square'
                                                />

                                                <Line
                                                    name="Durability %"
                                                    yAxisId="left"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => ((row.durabilityBeforeHit / chartDataCustom[0].durabilityBeforeHit) * 100).toFixed(0)}
                                                    stroke="#F76707"
                                                    strokeWidth={2}
                                                />

                                                <Line
                                                    name="Penetration Damage"
                                                    yAxisId="right"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.penetrationDamage).toFixed(0)}
                                                    stroke="#FFD43B"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    name="Average Damage"
                                                    yAxisId="right"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => ((row.penetrationDamage * row.penetrationChance) + (row.bluntDamage * (1 - row.penetrationChance))).toFixed(0)}
                                                    stroke="#FAB005"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    name="Blunt Damage"
                                                    yAxisId="right"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.bluntDamage).toFixed(0)}
                                                    stroke="#FFD43B"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    name="Penetration %"
                                                    yAxisId="left"
                                                    type="linear"
                                                    dataKey={(row: BallisticHit) => (row.penetrationChance * 100).toFixed(0)}
                                                    stroke="red"
                                                    strokeWidth={2}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Col>
                            </Row>
                            <div style={{ overflow: "auto" }}>
                                <Table striped bordered hover variant="dark" responsive="sm" >
                                    <thead>
                                        <tr>
                                            <th>Hit</th>
                                            <th>Armor Durability</th>
                                            <th>Durability Percentage</th>
                                            <th>Done Armor Damage</th>
                                            <th>Penetration Chance</th>

                                            <th>Blunt Damage</th>
                                            <th>Penetration Damage</th>
                                            <th>Average Damage</th>
                                            <th>Avg. HP Remaining</th>

                                            <th>Cumulative Chance of Kill</th>
                                            <th>Specific Chance of Kill</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultCustom.hits.map((item: BallisticHit, i: number) => {
                                            return (
                                                <tr>
                                                    <td>{i + 1}</td>
                                                    <td>
                                                        {item.durabilityBeforeHit.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        {((item.durabilityBeforeHit / resultCustom.hits[0].durabilityBeforeHit) * 100).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        {item.durabilityDamageTotalAfterHit.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        {i === 0 && (item.penetrationChance * 100).toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
                                                        {i > 0 && statDelta(resultCustom.hits[i].penetrationChance * 100, resultCustom.hits[i - 1].penetrationChance * 100, "%")}
                                                    </td>

                                                    <td>
                                                        {item.bluntDamage.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td>
                                                        {i === 0 && statDelta(resultCustom.hits[i].penetrationDamage, resultCustom.simulationParameters.damage, "")}
                                                        {i > 0 && statDelta(resultCustom.hits[i].penetrationDamage, resultCustom.hits[i - 1].penetrationDamage, "")}
                                                    </td>
                                                    <td>
                                                        {((item.bluntDamage * (1 - item.penetrationChance) + (item.penetrationDamage * item.penetrationChance))).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</td>
                                                    <td>
                                                        {item.averageRemainingHitPoints.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                                                    </td>

                                                    <td>
                                                        {i === 0 && statDelta(resultCustom.hits[i].cumulativeChanceOfKill, resultCustom.hits[i].cumulativeChanceOfKill, "%")}
                                                        {i > 0 && statDelta(resultCustom.hits[i].cumulativeChanceOfKill, resultCustom.hits[i - 1].cumulativeChanceOfKill, "%")}

                                                    </td>
                                                    <td>
                                                        {i === 0 && statDelta(resultCustom.hits[i].specificChanceOfKill, resultCustom.hits[i].specificChanceOfKill, "%")}
                                                        {i > 0 && statDelta(resultCustom.hits[i].specificChanceOfKill, resultCustom.hits[i - 1].specificChanceOfKill, "%")}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                            <Form.Text>
                                This chart was generated on: {new Date().toUTCString()} and is from https://tarkovgunsmith.com{LINKS.DAMAGE_SIMULATOR}
                            </Form.Text>

                        </Card.Body>

                    </Card>
                </Col>
            </>
        )
    }
    else {
        resultCard = (
            <Col xl>
                <Card bg="secondary" border="light" text="light" className="xl">
                    <Card.Body>
                        <Button variant="dark" disabled>
                            <Stack direction="horizontal" gap={2}>
                                <Spinner animation="grow" role="status" size="sm">
                                    <span className="visually-hidden"> Awaiting result</span>
                                </Spinner>
                                <div className="vr" />
                                Awaiting result
                            </Stack>
                        </Button>
                    </Card.Body>
                </Card>
            </Col>
        )
    }

    let content;
    if (result === undefined) {
        content = (
            <>
                <Stack gap={1}>
                    {topCard}
                    {resultCard}
                </Stack>
            </>
        )
    }
    else {
        content = (
            <>
                <Stack gap={1}>
                    {topCard}
                    {resultCard}
                </Stack>
            </>
        )
    }

    return (
        <Container className='main-app-container'>
            {content}
        </Container>
    );

}