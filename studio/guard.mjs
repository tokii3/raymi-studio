// node guard.mjs <job>  - the pre-render guards alone (pure math, no browser, safe on any PC)
import {guardCutEdges, loadJob} from './lib.mjs';

const {props} = loadJob(process.argv[2]);
await guardCutEdges(props, null);
