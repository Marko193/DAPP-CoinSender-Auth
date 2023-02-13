import { FunctionComponent, memo } from 'react';
import styles from '@/components/document-parcer/document-parser.module.scss';
import {
  Button,
  Alert,
  AlertTitle,
  Modal,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { FileExtensions } from '@/constants/impor-files';
import { makeShortenWalletAddress } from '@/helpers/stringUtils';
import { NoRowsOverlayComponent } from '@/components/no-rows-overlay/noRowsOverlay';
import moment from 'moment';
import { AlertComponent } from '../alert/alert';
import { LoaderComponent } from '../loader/loader';
import { LoaderStateInterface } from '../transfers/transfers.component';

interface DocumentParserComponentProps {
  open: boolean;
  handleUploadModal: () => void;
  setSelectedRows: (item: any) => void;
  selectedRows: any;
  tableData: any;
  handleFileImport: (e: any) => void;
  error: any;
  isLoading: LoaderStateInterface;
}

const DocumentParserComponent: FunctionComponent<DocumentParserComponentProps> = ({
  open,
  handleUploadModal,
  setSelectedRows,
  tableData,
  handleFileImport,
  error,
  isLoading,
}) => {
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'wallet',
      headerName: 'Wallet',
      flex: 1,
      renderCell: (params: GridRenderCellParams<string>) => makeShortenWalletAddress(params.value),
    },
    { field: 'amount', headerName: 'Amount', flex: 1 },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      renderCell: (params: GridRenderCellParams<string>) =>
        params.value
          ? moment(params.value).format('MMMM Do YYYY, h:mm:ss a')
          : 'No transaction yet',
    },
  ];

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '8px',
    p: 2,
  };

  return (
    <>
      <div className={styles.parserContainer}>
        {error && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            <Stack sx={{ whiteSpace: 'pre-wrap' }}>{error}</Stack>
          </Alert>
        )}
        {isLoading.loading ? (
          <LoaderComponent>
            <Typography>{isLoading.text}</Typography>
          </LoaderComponent>
        ) : (
          <div className={styles.tableContainer}>
            <AlertComponent sx={{ mb: 2 }} severity="info">
              We take a 0.1% fee per transaction from the payer. The total amount already includes
              the fee.
            </AlertComponent>
            <DataGrid
              rows={
                tableData &&
                tableData.map((item: any, index: number) => ({
                  id: index,
                  ...item,
                }))
              }
              sx={{
                '& .MuiDataGrid-columnHeader:last-child .MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
              }}
              hideFooterPagination
              disableColumnMenu
              columns={columns}
              components={{
                NoRowsOverlay: () => (
                  <NoRowsOverlayComponent title="Upload the list to make a transaction" />
                ),
              }}
              checkboxSelection
              onSelectionModelChange={(ids) => {
                const selectedIDs = new Set(ids);
                const dataWithId = tableData.map((item: any, index: number) => ({
                  id: index,
                  ...item,
                }));
                const selectedRows = dataWithId.filter((row: any) => selectedIDs.has(row.id));

                setSelectedRows(selectedRows);
              }}
            />
          </div>
        )}
      </div>
      <Modal
        open={open}
        onClose={handleUploadModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Stack sx={style}>
          <Alert severity="info">
            <AlertTitle>Info</AlertTitle>
            <Stack mb={2}>
              <Typography fontSize="13px" fontStyle="italic" textAlign="justify">
                All data in the line (name, wallet, amount) must be filled.
                <br />
                Field name may contain letters or numbers.
                <br />
                Field wallet must contain a valid wallet.
                <br />
                Field amount must contain a number, a valid delimiter is a dot (0.01).
              </Typography>
            </Stack>
            You can download an example file —{' '}
            <strong>
              <a
                rel="noreferrer"
                href={`https://cs-payments.s3.amazonaws.com/example-download+.csv`}
                target="_blank"
                download
              >
                {FileExtensions.CSV}
              </a>
              {' / '}
              <a
                rel="noreferrer"
                href={`https://cs-payments.s3.amazonaws.com/example-download+.xlsx`}
                target="_blank"
                download
              >
                {FileExtensions.XLSX}
              </a>
            </strong>
            .
          </Alert>
          <Stack mt={2}>
            <Button variant="contained" component="label">
              Upload
              <input
                onChange={(e) => {
                  handleUploadModal();
                  handleFileImport(e);
                }}
                hidden
                type="file"
              />
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

export default memo(DocumentParserComponent);
