import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_AVANCES, AVANCES } from 'graphql/auth/avances/queries';
import { useParams } from 'react-router-dom';
import { Dialog } from '@mui/material';
import Input from 'components/Input';
import ButtonLoading from 'components/ButtonLoading';
import useFormData from 'hooks/useFormData';
import { CREAR_AVANCE } from 'graphql/auth/avances/mutations';
import { useUser } from 'context/userContext';
import { toast } from 'react-toastify';

const NuevoAvance = () => {
    const { projectid } = useParams();
    const [openDialog, setOpenDialog] = useState(false);

    // falta captura de error del loading
    const { data, loading } = useQuery(GET_AVANCES, {
        variables: {
            proyecto: projectid,
        },
    });

    if (loading) return <div>Loading...</div>;
    
    
console.log('data', data);
    

    return (
        <div className='flex flex-col p-10 items-center w-full'>
            <h1 className='text-2xl font-bold text-gray-900 my-2'>
                Avances para el proyecto {projectid}
            </h1>
            <button
                onClick={() => setOpenDialog(true)}
                className='flex-end bg-pink-600 p-2 rounded-lg text-white my-2 hover:bg-purple-900'
                type='button'
            >
                Crear nuevo avance
            </button>
            {data.AvancesEstudiante.length === 0 ? (
                <span>No tienes avances para este proyecto</span>
            ) : (
                data.AvancesEstudiante.map((avance) => <Avance avance={avance} />)
            )}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <CrearAvance proyecto={projectid} setOpenDialog={setOpenDialog} />
            </Dialog>
        </div>
    );
};

const Avance = ({ avance }) => {
    return (
        <div className='flex flex-col bg-green-900 text-white shadow-lg p-3 rounded-xl m-2'>
            <span>
                <strong>Avance:</strong> {avance.descripcion}
            </span>
            <span>
                <strong>Fecha: </strong>
                {avance.fecha}
            </span>
            <span>{avance.observaciones.length === 0 && 'Sin comentarios'}</span>
        </div>
    );
};

const CrearAvance = ({ proyecto, setOpenDialog }) => {
    const { userData } = useUser();
    const { form, formData, updateFormData } = useFormData();

    const [crearAvance, { loading }] = useMutation(CREAR_AVANCE, {
        refetchQueries: [GET_AVANCES],
    });

    const submitForm = (e) => {
        e.preventDefault();

        crearAvance({
            variables: { ...formData, proyecto, creadoPor: userData._id },
        })
            .then(() => {
                toast.success('avance creado con exito');
                setOpenDialog(false);
            })
            .catch(() => {
                toast.error('error creando el avance');
            });
    };
    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold text-gray-900'>Crear Nuevo Avance</h1>
            <form ref={form} onChange={updateFormData} onSubmit={submitForm}>
                <Input name='descripcion' label='Descripción' type='text' />
                <Input name='fecha' label='Fecha' type='date' />
                <ButtonLoading
                    text='Crear Avance'
                    loading={loading}
                    disabled={Object.keys(formData).length === 0}
                />
            </form>
        </div>
    );
};

export default NuevoAvance;