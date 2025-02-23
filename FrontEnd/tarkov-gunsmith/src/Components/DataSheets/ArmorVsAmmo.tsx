import { Box } from "@mui/material"
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table"
import { useState, useEffect, useMemo } from "react"
import { Col, Card, Form, Container, Button } from "react-bootstrap"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { API_URL } from "../../Util/util"
import { ArmorOption } from "../ADC/ArmorData";
import SelectArmor from "../ADC/SelectArmor";
import { requestArmorVsAmmo } from "../../Context/Requests";
import { effectivenessDataRow } from "./DataSheetTypes";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LINKS } from "../../Util/links";
import ImageWithDefaultFallback from "../Common/ImageWithFallBack";

export default function DataSheetEffectivenessArmor(props: any) {
    const navigate = useNavigate();
    const { id_armor } = useParams();

    //! Armor Selection List
    // Selector - Init
    const [ArmorOptions, setArmorOptions] = useState<ArmorOption[]>([]);
    const [defaultSelection, setDefaultSelection] = useState<ArmorOption>();

    const armors = async () => {
        const response = await fetch(API_URL + '/GetArmorOptionsList');
        setArmorOptions(await response.json())
    }
    useEffect(() => {
        armors();
    }, [])

    useEffect(() => {
        if (id_armor !== undefined && ArmorOptions.length > 0) {
            getArmorVsAmmoData(id_armor);

            var temp = ArmorOptions.find((x) => x.value === id_armor)
            if (temp !== undefined) {
                handleArmorSelection(temp);
                setDefaultSelection(temp);
            }
        }
    }, [ArmorOptions, id_armor])

    // Selector - Selection
    const [armorId, setArmorId] = useState("");

    function handleArmorSelection(selectedOption: ArmorOption) {
        setArmorId(selectedOption.value);
        navigate(`${LINKS.ARMOR_VS_AMMO}/${selectedOption?.value}`);
    }

    const getArmorVsAmmoData = (id: string) => {
        requestArmorVsAmmo(id).then(response => {
            // // console.log(response)
            setArmorTableData(response);

        }).catch(error => {
            alert(`The error was: ${error}`);
            // // console.log(error);
        });
    }



    // If using TypeScript, define the shape of your data (optional, but recommended)
    // strongly typed if you are using TypeScript (optional, but recommended)
    const [ArmorTableData, setArmorTableData] = useState<effectivenessDataRow[]>([]);


    //column definitions - strongly typed if you are using TypeScript (optional, but recommended)
    const columns = useMemo<MRT_ColumnDef<effectivenessDataRow>[]>(
        () => [
            {
                accessorKey: 'ammoName', //simple recommended way to define a column
                header: 'Name',
                muiTableHeadCellProps: { sx: { color: 'white' } }, //custom props
                size: 10, //small column
                enableSorting: true,
                Cell: ({ renderedCellValue, row }) => (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}
                    >
                        <ImageWithDefaultFallback
                            alt="avatar"
                            height={40}
                            src={`https://assets.tarkov.dev/${row.original.ammoId}-icon.webp`}
                            loading="lazy"
                        />
                        {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                        <span><Link to={`${LINKS.DAMAGE_SIMULATOR}/${row.original.armorId}/${row.original.ammoId}`}>{renderedCellValue}</Link></span>
                    </Box>
                ),
            },
            {
                accessorKey: 'firstShot_PenChance',
                header: 'First Shot PenChance',
                muiTableHeadCellProps: { sx: { color: 'white' } },
                size: 10, //small column
                Cell: ({ cell }) => (
                    <span>{(cell.getValue<number>()).toLocaleString("en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 })} %</span>
                ),
            },
            {
                accessorKey: 'firstShot_PenDamage',
                header: 'First Shot PenDamage',
                muiTableHeadCellProps: { sx: { color: 'white' } },
                size: 10, //small column
                Cell: ({ cell }) => (
                    <span>{(cell.getValue<number>()).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                ),
            },
            {
                accessorKey: 'firstShot_BluntDamage',
                header: 'First Shot BluntDamage',
                muiTableHeadCellProps: { sx: { color: 'white' } },
                size: 10, //small column
                Cell: ({ cell }) => (
                    <span>{(cell.getValue<number>()).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                ),
            },
            {
                accessorKey: 'firstShot_ArmorDamage',
                header: 'First Shot ArmorDamage',
                muiTableHeadCellProps: { sx: { color: 'white' } },
                size: 10, //small column
                Cell: ({ cell }) => (
                    <span>{(cell.getValue<number>()).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                ),
            },
            {
                accessorKey: 'expectedShotsToKill',
                header: 'Expected Shots To Kill',
                muiTableHeadCellProps: { sx: { color: 'white' } },
                size: 10, //small column
            },
            {
                accessorKey: 'expectedKillShotConfidence',
                header: 'Kill shot Confidence',
                muiTableHeadCellProps: { sx: { color: 'white' } },
                size: 10, //small column
                Cell: ({ cell }) => (
                    <span>{(cell.getValue<number>()).toLocaleString("en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 })} %</span>
                ),
            },

        ],
        [],
    );

    //store pagination state in your own state
    const [pagination] = useState({
        pageIndex: 0,
        pageSize: 200, //customize the default page size
    });

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    return (
        <Container className='main-app-container'>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <Col xxl>
                    <Card bg="dark" border="secondary" text="light" className="xxl">
                        <Card.Header as="h2" >
                            Armor vs Ammo
                        </Card.Header>

                        <Card.Body>
                            <>
                                <strong>Available Choices:</strong> {ArmorOptions.length} <br />
                                <Form>
                                    <Form.Text>You can search by the name by selecting this box and typing.</Form.Text>
                                    <SelectArmor handleArmorSelection={handleArmorSelection} armorOptions={ArmorOptions} style={{}} selectedId={armorId} defaultSelection={defaultSelection} />
                                    <br />
                                </Form>
                            </>
                        </Card.Body>
                        <Card.Footer>
                            This table starts with a few columns hidden by default. Press "Show/Hide Columns" on the right to change what is visible. <br />
                            This table starts with ammo grouped by Expected Hits to Kill and these groups are closed, click the group to expand these rows.<br />
                            Currently will show all ammo with 20 penetration or above, and less than or equal to the (AC *10) + 15.<br />
                            Drag and drop a column to move it or to the top bar with the '=' to add it to the grouping. <br />
                        </Card.Footer>
                    </Card>

                    <MaterialReactTable
                        renderTopToolbarCustomActions={({ table }) => (
                            <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
                                <Button
                                    disabled
                                    size='sm'
                                    className="mb-2"
                                    variant="outline-info"
                                >
                                    Displaying data for: {(ArmorTableData.at(0)?.armorName)} @ 10m
                                </Button>
                            </Box>
                        )}
                        columns={columns}
                        data={ArmorTableData}

                        enableRowSelection={false}//enable some features
                        enableSelectAll={false}

                        enableColumnOrdering
                        enableGrouping
                        enablePinning
                        enableMultiSort={true}
                        enableGlobalFilter={true} //turn off a feature
                        enableDensityToggle={false}
                        initialState={{
                            density: 'compact',
                            columnVisibility: {
                                firstShot_BluntDamage: false,
                                firstShot_ArmorDamage: false
                            },
                            pagination: pagination,

                            grouping: ['expectedShotsToKill'], //an array of columns to group by by default (can be multiple)
                            expanded: true, //expand all groups by default
                            sorting: [{ id: 'expectedShotsToKill', desc: false }, { id: 'expectedKillShotConfidence', desc: true }], //sort by state by default
                        }} //hide AmmoRec column by default

                        defaultColumn={{
                            minSize: 10, //allow columns to get smaller than default
                            maxSize: 40, //allow columns to get larger than default
                            size: 10, //make columns wider by default
                        }}
                        enableStickyHeader

                        sortDescFirst
                        muiTablePaginationProps={{
                            rowsPerPageOptions: [10, 25, 50, 75, 100, 150, 200],
                        }}
                    />
                </Col>
            </ThemeProvider>
        </Container>

    )
}