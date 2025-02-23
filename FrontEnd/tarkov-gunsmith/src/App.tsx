import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import { Helmet } from "react-helmet-async"
import {
  BrowserRouter, Route, Routes
} from "react-router-dom";
// import {Header} from './Components/Header';
import Home from './Components/Home';
import PageNotFound from './Components/PageNotFound';
import About from './Components/About';
import { LINKS } from './Util/links';
import MwbBasePage from './Components/MWB/MwbBasePage';
import { MantineProvider } from '@mantine/core';
import AmmoMRT from './Components/Common/Tables/tgTables/AmmoMRT';
import { WeaponMRT } from './Components/Common/Tables/tgTables/WeaponMRT';
import { HelmetsMRT } from './Components/Common/Tables/tgTables/HelmetsMRT';
import { ArmorMRT } from './Components/Common/Tables/tgTables/ArmorMRT';
import { TgAppShell } from './Components/Common/TgAppShell';
import { ArmorModulesMRT } from './Components/Common/Tables/tgTables/ArmorModulesMRT';
import { BallisticsSimulator } from './Pages/BallisticsSimulator/BallisticsSimulator';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './Util/SEO';
import { BallisticCalculator } from './Pages/BallisticCalculator/BallisticCalculator';

function App() {
  return (
    <>
      <HelmetProvider>
        <SEO url="https://tarkovgunsmith.com" title={'Tarkov Gunsmith'}/>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: 'dark',
            breakpoints: {
              xs: '30em', // 480
              sm: '48em', // 766
              md: '64em', // 1024
              lg: '74em', // 1184
              xl: '1730px',
            },
            components: {
              Container: {
                defaultProps: {
                  sizes: {
                    xs: 540,
                    sm: 720,
                    md: 960,
                    lg: 1140,
                    xl: 1320,
                    xxl: 1780
                  },
                },
              },
            },
          }
          }>
          <BrowserRouter>
            <TgAppShell>
              {/* <Header /> */}
              <Routes>
                <Route path={"/"} element={<Home />} />
                <Route path={LINKS.HOME} element={<Home />} />
                <Route path={LINKS.ABOUT} element={<About />} />
                <Route path={LINKS.MODDED_WEAPON_BUILDER} element={<MwbBasePage />} />
                {/* <Route path={LINKS.DAMAGE_SIMULATOR} element={<ArmorDamageCalculator />} />
              <Route path={`${LINKS.DAMAGE_SIMULATOR}/:id_armor/:id_ammo`} element={<ArmorDamageCalculator />} />
              <Route path={`${LINKS.DAMAGE_SIMULATOR}/:id_armor/`} element={<ArmorDamageCalculator />} />
              <Route path={`${LINKS.DAMAGE_SIMULATOR}//:id_ammo`} element={<ArmorDamageCalculator />} /> */}

                <Route path={LINKS.DATA_SHEETS_WEAPONS} element={<WeaponMRT />} />
                <Route path={LINKS.DATA_SHEETS_AMMO} element={<AmmoMRT />} />

                <Route path={LINKS.DATA_SHEETS_PLATES_INSERTS} element={<ArmorModulesMRT />} />
                <Route path={LINKS.DATA_SHEETS_ARMOR_MODULES} element={<ArmorModulesMRT />} />
                <Route path={LINKS.DATA_SHEETS_HELMETS} element={<HelmetsMRT />} />
                <Route path={LINKS.DATA_SHEETS_ARMOR} element={<ArmorMRT />} />

                <Route path={LINKS.BALLISTICS_SIMULATOR} element={<BallisticsSimulator />} />

                <Route path={LINKS.BALLISTIC_CALCULATOR} element={<BallisticCalculator />} />

                {/* <Route path={LINKS.ARMOR_VS_AMMO} element={<DataSheetEffectivenessArmor />} />
            <Route path={`${LINKS.ARMOR_VS_AMMO}/:id_armor`} element={<DataSheetEffectivenessArmor />} />

            <Route path={LINKS.AMMO_VS_ARMOR} element={<DataSheetEffectivenessAmmo />} />
            <Route path={`${LINKS.AMMO_VS_ARMOR}/:id_ammo`} element={<DataSheetEffectivenessAmmo />} />

            <Route path={LINKS.AMMO_EFFECTIVENESS_CHART} element={<AmmoEffectivenessChartPage/>} /> */}

                {/* Page not found */}
                <Route path='*' element={<PageNotFound />} />
              </Routes>

            </TgAppShell>

          </BrowserRouter>
        </MantineProvider>
      </HelmetProvider>
    </>
  );
}

export default App;
