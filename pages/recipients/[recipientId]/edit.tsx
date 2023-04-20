import { Form, FormikProvider, useFormik } from 'formik';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { isAddress } from '@ethersproject/address';
import { Box, Button, Grid, Stack, TextField } from '@mui/material';
import { PageTitle } from '@/components/pageTitle';
import WarningModal from '@/components/warningModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from '@/components/header/header.component';
import DashboardSidebar from '@/components/sidebar';
import styles from '@/layouts/main-layout.module.scss';
import { RouteGuard } from '@/components/routeGuard/routeGuard';
import { getRecipientById, updateRecipient } from '@/services/recipients';
import { useRouter } from 'next/router';
import Router from 'next/router';
import { ROOT_URL } from '@/constants/general';

export default function EditRecipient() {

  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editedRecipient, setEditedRecipient] = useState<any>({});

  const router = useRouter();
  const { recipientId } = router.query;

  useEffect(() => {
    if (recipientId !== undefined) {
      (async () => {
        try {
          const { data } = await getRecipientById(recipientId);

          setEditedRecipient(data.data);
          // setEditedRecipient({...data.data, amount: Number(data.data.amount).toFixed(2)});
        } catch (error: any) {
          toast.error(error.response.data.message);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [recipientId]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().max(15, 'Maximum length 15 characters').required('Is required'),
    amount: Yup.string().required('Is required'),
    wallet_address: Yup.string()
      .label('Wallet address')
      .required()
      .test('Is address', 'Please enter correct wallet address', (value) => isAddress(value)),
  });

  const formik = useFormik({
    initialValues: {
      name: editedRecipient.name,
      amount: editedRecipient.amount,
      wallet_address: editedRecipient.wallet_address,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      console.log('values', values);
      try {
        const response = await updateRecipient(values);
        console.log('response', response);
        if (response.status === 201) {
          toast.success(response.data.message);
          await Router.push(`${ROOT_URL}/recipients`);
        }
      } catch (error: any) {
        // console.log('error', error);
        toast.error(error.response.data.message);
      }
    },
  });

  const { errors, touched, isValid, handleSubmit, getFieldProps } = formik;

  // console.log(editedRecipient, isLoading);

  return (
    <>
      <Head>
        <title>Edit recipient</title>
        <meta name='description' content='Edit recipient' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.svg' />
      </Head>

      <RouteGuard>
        <Header onOpenSidebar={() => setOpen(true)} />
        <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
        <div className={styles.main_layout}>
          <WarningModal open={isOpen} type={'/recipients/add'} close={() => setIsOpen(false)} />
          <Stack>
            <PageTitle title='Edit recipient' path={'/recipients'}
              // handler={() => setIsOpen(true)}
            />
            <Grid container>
              <Box
                sx={{
                  padding: 3,
                  width: '100%',
                  boxShadow:
                    'rgb(145 158 171 / 20%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px',
                }}
              >
                {isLoading ? <>Loading...</> :
                  (
                    <FormikProvider value={formik}>
                      <Form autoComplete='off' noValidate onSubmit={handleSubmit}>
                        <Stack direction='row' gap='20px'>
                          <Stack width='50%' gap='16px'>
                            <Stack direction='row' justifyContent='space-between'>
                              <TextField
                                required
                                fullWidth
                                label='Name'
                                type='text'
                                {...getFieldProps('name')}
                                error={Boolean(touched.name && errors.name)}
                                helperText={touched.name && errors.name}
                              />
                            </Stack>
                            <Stack direction='row' justifyContent='space-between'>
                              <TextField
                                required
                                fullWidth
                                label='Amount'
                                type='text'
                                {...getFieldProps('amount')}
                                error={Boolean(touched.amount && errors.amount)}
                                helperText={touched.amount && errors.amount}
                              />
                            </Stack>
                            <Stack direction='row' justifyContent='space-between'>
                              <TextField
                                required
                                fullWidth
                                label='Wallet address'
                                type='text'
                                {...getFieldProps('wallet_address')}
                                error={Boolean(touched.wallet_address && errors.wallet_address)}
                                helperText={touched.wallet_address && errors.wallet_address}
                              />
                            </Stack>
                          </Stack>
                          <Stack width='50%' alignItems='center' justifyContent='center'>
                            {/*<AvatarUpload flag="new" handler={setFieldValue} avatar={values?.avatar} />*/}
                          </Stack>
                        </Stack>
                        <Stack mt={2} spacing={2}>
                          <Stack direction='row' gap={2}>
                            <Button
                              type='submit'
                              sx={{ height: '30px' }}
                              disabled={!isValid}
                              variant='contained'
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setIsOpen(true)}
                              sx={{ height: '30px' }}
                              variant='contained'
                            >
                              Cancel
                            </Button>
                          </Stack>
                        </Stack>
                      </Form>
                    </FormikProvider>
                  )}
              </Box>
            </Grid>
          </Stack>
          <ToastContainer />
        </div>
      </RouteGuard>
    </>
  );
}
