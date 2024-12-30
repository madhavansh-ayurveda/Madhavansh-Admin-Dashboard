import { useEffect, useState } from 'react'
import { adminApi } from '@/api/adminApi'
import { User } from '@/types'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'

export default function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                console.log('fetching users')
                const data = await adminApi.getAllUsers()
                console.log(data);

                setUsers(data)
            } catch (error) {
                console.error('Error fetching users:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Users Management</h1>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email || " NA "}</TableCell>
                                <TableCell>{user.contact}</TableCell>
                                <TableCell>{user.age || " NA "}</TableCell>
                                <TableCell>
                                    {/* {new Date(user.createdAt).toLocaleDateString()} */}
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
} 